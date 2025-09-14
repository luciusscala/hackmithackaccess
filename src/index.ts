import { AppServer, AppSession, ViewType, AuthenticatedRequest, PhotoData } from '@mentra/sdk';
import { Request, Response } from 'express';
import * as ejs from 'ejs';
import * as path from 'path';
import fs from 'fs';
import axios from 'axios';

/**
 * Interface representing a stored photo with metadata
 */
interface StoredPhoto {
  requestId: string;
  buffer: Buffer;
  timestamp: Date;
  userId: string;
  mimeType: string;
  filename: string;
  size: number;
}

const PACKAGE_NAME = process.env.PACKAGE_NAME ?? (() => { throw new Error('PACKAGE_NAME is not set in .env file'); })();
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY ?? (() => { throw new Error('MENTRAOS_API_KEY is not set in .env file'); })();
const PORT = parseInt(process.env.PORT || '3000');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Photo Taker App with webview functionality for displaying photos
 * Extends AppServer to provide photo taking and webview display capabilities
 */
class ExampleMentraOSApp extends AppServer {
  private photos: Map<string, StoredPhoto> = new Map(); // Store photos by userId
  private latestPhotoTimestamp: Map<string, number> = new Map(); // Track latest photo timestamp per user
  private processingTasks: Map<string, string> = new Map(); // Track processing task IDs by userId

  constructor() {
    super({
      packageName: PACKAGE_NAME,
      apiKey: MENTRAOS_API_KEY,
      port: PORT,
    });
    this.setupWebviewRoutes();
  }


  /**
   * Handle new session creation and button press events
   */
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    // this gets called whenever a user launches the app
    this.logger.info(`Session started for user ${userId}`);

    // this gets called whenever a user presses a button
    session.events.onButtonPress(async (button) => {
      this.logger.info(`Button pressed: ${button.buttonId}, type: ${button.pressType}`);

      if (button.pressType === 'short') {
        session.layouts.showTextWall("Taking photo...", {durationMs: 2000});
        
        try {
          // Take a photo
          const photo = await session.camera.requestPhoto();
          this.logger.info(`Photo taken for user ${userId}, timestamp: ${photo.timestamp}`);
          
          // Save to file
          const filename = `photo_${Date.now()}.jpg`;
          const filepath = path.join('photos', filename);
          fs.writeFileSync(filepath, photo.buffer);
          this.logger.info(`Photo saved to file: ${filepath}`);

          // Cache photo locally
          this.cachePhoto(photo, userId);

          // Send to backend for processing
          await this.processPhoto(photo, userId, session);
          
        } catch (error) {
          this.logger.error(`Error taking photo: ${error}`);
          session.layouts.showTextWall("Error taking photo", {durationMs: 3000});
        }
      }
    });
  }

  protected async onStop(sessionId: string, userId: string, reason: string): Promise<void> {
    // clean up the user's state
    this.logger.info(`Session stopped for user ${userId}, reason: ${reason}`);
  }

  /**
   * Cache a photo for display
   */
  private async cachePhoto(photo: PhotoData, userId: string) {
    // create a new stored photo object which includes the photo data and the user id
    const cachedPhoto: StoredPhoto = {
      requestId: photo.requestId,
      buffer: photo.buffer,
      timestamp: photo.timestamp,
      userId: userId,
      mimeType: photo.mimeType,
      filename: photo.filename,
      size: photo.size
    };

    // cache the photo for display
    this.photos.set(userId, cachedPhoto);
    // update the latest photo timestamp
    this.latestPhotoTimestamp.set(userId, cachedPhoto.timestamp.getTime());
    this.logger.info(`Photo cached for user ${userId}, timestamp: ${cachedPhoto.timestamp}`);
  }

  /**
   * Process photo by sending to backend
   */
  private async processPhoto(photo: PhotoData, userId: string, session: AppSession) {
    try {
      session.layouts.showTextWall("Processing photo...", {durationMs: 3000});
      
      // Create FormData to send photo to backend
      const formData = new FormData();
      const blob = new Blob([photo.buffer], { type: photo.mimeType });
      formData.append('file', blob, `photo_${Date.now()}.jpg`);

      // Send to backend
      const response = await axios.post(`${BACKEND_URL}/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000
      });

      if (response.data && response.data.task_id) {
        this.processingTasks.set(userId, response.data.task_id);
        this.logger.info(`Photo processing started, task ID: ${response.data.task_id}`);
        session.layouts.showTextWall("Photo processing started!", {durationMs: 3000});
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (error) {
      this.logger.error(`Error processing photo: ${error}`);
      session.layouts.showTextWall("Error processing photo", {durationMs: 3000});
    }
  }


  /**
 * Set up webview routes for photo display functionality
 */
  private setupWebviewRoutes(): void {
    const app = this.getExpressApp();

    // API endpoint to get processing status
    app.get('/api/processing-status', (req: any, res: any) => {
      const userId = (req as AuthenticatedRequest).authUserId;

      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const taskId = this.processingTasks.get(userId);
      const photo = this.photos.get(userId);

      res.json({
        hasPhoto: !!photo,
        taskId: taskId || null,
        photoTimestamp: photo ? photo.timestamp.getTime() : null
      });
    });

    // API endpoint to get photo data
    app.get('/api/photo/:requestId', (req: any, res: any) => {
      const userId = (req as AuthenticatedRequest).authUserId;
      const requestId = req.params.requestId;

      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const photo = this.photos.get(userId);
      if (!photo || photo.requestId !== requestId) {
        res.status(404).json({ error: 'Photo not found' });
        return;
      }

      res.set({
        'Content-Type': photo.mimeType,
        'Cache-Control': 'no-cache'
      });
      res.send(photo.buffer);
    });

    // Simple webview route - shows processing status
    app.get('/webview', async (req: any, res: any) => {
      const userId = (req as AuthenticatedRequest).authUserId;

      if (!userId) {
        res.status(401).send(`
          <html>
            <head><title>Photo Processor - Not Authenticated</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Please open this page from the MentraOS app</h1>
            </body>
          </html>
        `);
        return;
      }

      const templatePath = path.join(process.cwd(), 'views', 'photo-viewer.ejs');
      const html = await ejs.renderFile(templatePath, {});
      res.send(html);
    });

    // Health check endpoint for Railway
    app.get('/', (req: any, res: any) => {
      res.json({
        message: 'MentraOS Photo Taker App',
        status: 'running',
        version: '1.0.0',
        backend_url: BACKEND_URL,
        port: PORT
      });
    });
  }
}



// Start the server
// DEV CONSOLE URL: https://console.mentra.glass/
// Get your webhook URL from ngrok (or whatever public URL you have)
const app = new ExampleMentraOSApp();

app.start().catch(console.error);