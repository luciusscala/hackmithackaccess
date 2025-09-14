# MentraOS App Railway Deployment Guide

## Prerequisites

1. **Backend deployed** - Your FastAPI backend should be deployed first
2. **Railway account** - Sign up at [railway.app](https://railway.app)
3. **GitHub repository** - Connected to Railway
4. **MentraOS API key** - From [console.mentra.glass](https://console.mentra.glass)

## Deployment Steps

### 1. Deploy MentraOS App to Railway

1. **Create New Service**
   - Go to your Railway project
   - Click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to `hackmit_access`

2. **Configure Environment Variables**
   ```
   PACKAGE_NAME=com.hackmit.mentramusic
   MENTRAOS_API_KEY=your_mentraos_api_key_here
   BACKEND_URL=https://your-backend.railway.app
   PORT=3000
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note the generated URL (e.g., `https://your-app.railway.app`)

### 2. Register with MentraOS Console

1. **Go to MentraOS Console**
   - Navigate to [console.mentra.glass](https://console.mentra.glass)
   - Sign in with your MentraOS account

2. **Update App Configuration**
   - Find your app: `com.hackmit.mentramusic`
   - Update "Public URL" to your Railway URL
   - Example: `https://your-app.railway.app`

3. **Add Required Permissions**
   - Camera permission (for photo capture)
   - Microphone permission (if needed)

### 3. Test the Deployment

1. **Health Check**
   ```bash
   curl https://your-app.railway.app/
   ```

2. **Test Photo Upload**
   - Use MentraOS glasses to take a photo
   - Check Railway logs for processing
   - Verify backend receives the photo

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PACKAGE_NAME` | Your MentraOS app package name | `com.hackmit.mentramusic` |
| `MENTRAOS_API_KEY` | API key from MentraOS console | `5de2bee3c6a98c1aa4a0728188f1a32b...` |
| `BACKEND_URL` | URL of your deployed backend | `https://your-backend.railway.app` |
| `PORT` | Port for the app (Railway sets this) | `3000` |

## Troubleshooting

### Common Issues

1. **App not connecting to MentraOS**
   - Check PACKAGE_NAME matches MentraOS console
   - Verify MENTRAOS_API_KEY is correct
   - Ensure Public URL is set correctly

2. **Photos not being sent to backend**
   - Check BACKEND_URL is correct
   - Verify backend is running and accessible
   - Check Railway logs for HTTP errors

3. **Build failures**
   - Check Dockerfile syntax
   - Verify all dependencies are in package.json
   - Check Railway build logs

### Debug Commands

```bash
# Check app health
curl https://your-app.railway.app/

# Check processing status (requires authentication)
curl https://your-app.railway.app/api/processing-status

# View Railway logs
# Use Railway dashboard or CLI
```

## File Structure

```
hackmit_access/
├── docker/
│   └── Dockerfile          # Docker configuration
├── src/
│   └── index.ts            # Main app file
├── views/
│   └── photo-viewer.ejs    # Webview template
├── package.json            # Dependencies
├── railway.json           # Railway configuration
├── .dockerignore          # Docker ignore file
└── .env                   # Environment variables (local only)
```

## Production Considerations

1. **Scaling** - Railway auto-scales based on traffic
2. **Monitoring** - Use Railway dashboard for logs and metrics
3. **Security** - Environment variables are encrypted
4. **Updates** - Push to GitHub to trigger new deployments
5. **Backup** - Photos are stored temporarily, consider persistent storage

## Next Steps

After successful deployment:
1. Test with MentraOS glasses
2. Monitor Railway logs
3. Set up monitoring/alerts if needed
4. Consider adding persistent storage for photos
