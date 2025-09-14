# AuraTune MentraOS App

MentraOS application that captures photos from smart glasses and sends them to the AuraTune backend for AI music video generation.

## 🎯 Overview

This MentraOS app serves as the bridge between MentraOS smart glasses and the AuraTune backend service. It handles photo capture, processing status, and communication with the AI video generation pipeline.

## 🚀 Quick Start

### Prerequisites

- MentraOS app installed on your phone ([mentra.glass/install](https://mentra.glass/install))
- Node.js 18+ and npm/bun
- ngrok account and static domain
- AuraTune backend running locally

### Step 1: Install MentraOS

1. **Download MentraOS**:
   - Visit [mentra.glass/install](https://mentra.glass/install)
   - Install the app on your phone
   - Create an account if you don't have one

### Step 2: Set Up ngrok Tunnel

1. **Install ngrok**:
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Create ngrok account** and get your auth token:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

3. **Start ngrok tunnel** (keep this running):
   ```bash
   ngrok http 3000 --domain=your-static-domain.ngrok.io
   ```
   Note your ngrok URL (e.g., `https://abc123.ngrok.io`)

### Step 3: Register App with MentraOS

1. **Navigate to MentraOS Console**:
   - Go to [console.mentra.glass](https://console.mentra.glass/)
   - Sign in with your MentraOS account

2. **Create New App**:
   - Click "Create App"
   - Package name: `com.yourname.auratune`
   - Public URL: `https://your-static-domain.ngrok.io`
   - Add camera permission

3. **Get API Key**:
   - Copy your API key from the console
   - You'll need this for the `.env` file

### Step 4: Configure and Run App

1. **Navigate to app directory**:
   ```bash
   cd hackmit_access
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or: npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   PORT=3000
   PACKAGE_NAME=com.yourname.auratune
   MENTRAOS_API_KEY=your_api_key_from_console
   BACKEND_URL=http://localhost:8000
   ```

4. **Start the app**:
   ```bash
   bun run dev
   # or: npm run dev
   ```

5. **Verify it's running**:
   - App will be available at `http://localhost:3000`
   - Status page: `http://localhost:3000/webview`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | App port | `3000` | ✅ |
| `PACKAGE_NAME` | MentraOS package name | `com.yourname.auratune` | ✅ |
| `MENTRAOS_API_KEY` | API key from console | `ak_1234567890` | ✅ |
| `BACKEND_URL` | Backend service URL | `http://localhost:8000` | ✅ |

### MentraOS Console Settings

- **Package Name**: Must match `PACKAGE_NAME` in `.env`
- **Public URL**: Must match your ngrok URL
- **Permissions**: Camera access required
- **Webhook URL**: Optional, for advanced features

## 📱 How It Works

### Photo Capture Flow

1. **User Action**: Press button on MentraOS glasses
2. **Photo Capture**: MentraOS takes photo and sends to app
3. **Processing**: App receives photo via MentraOS API
4. **Backend Communication**: Photo sent to AuraTune backend
5. **Status Updates**: App tracks processing progress
6. **Result Display**: Shows final video when ready

### API Endpoints

- `GET /` - App status and information
- `GET /webview` - Simple status display for MentraOS
- `POST /api/photo` - Receive photos from MentraOS
- `GET /api/processing-status` - Current processing status
- `GET /api/photo/{requestId}` - Get specific photo data

## 📁 File Structure

```
hackmit_access/
├── src/
│   └── index.ts              # Main app logic
├── views/
│   └── photo-viewer.ejs      # Status display template
├── photos/                   # Captured photos (auto-created)
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── railway.json              # Railway deployment config
└── README.md                 # This file
```

## 🎵 Integration with AuraTune

### Backend Communication

The app communicates with the AuraTune backend through:

1. **Photo Upload**: Sends base64-encoded photos to `/upload-photo`
2. **Status Polling**: Checks processing status via `/photos/{task_id}/status`
3. **Result Retrieval**: Downloads final videos from `/photos/{task_id}/download`

### Processing States

- **`uploading`**: Photo being sent to backend
- **`generating`**: AI creating music and video
- **`converting`**: FFmpeg processing video
- **`merging`**: Combining audio and video
- **`done`**: Video ready for download
- **`error`**: Processing failed

## 🚨 Troubleshooting

### Common Issues

1. **MentraOS not connecting**:
   - Verify package name matches console registration
   - Check API key is correct
   - Ensure ngrok URL is accessible from internet
   - Restart MentraOS app

2. **Backend communication failed**:
   - Ensure backend is running on port 8000
   - Check `BACKEND_URL` in `.env` file
   - Verify network connectivity

3. **Photo upload errors**:
   - Check file size limits
   - Verify photo format is supported
   - Check backend logs for errors

4. **ngrok connection issues**:
   - Verify ngrok is running: `ngrok status`
   - Check auth token: `ngrok config check`
   - Ensure port 3000 is available

### Debugging

1. **Check app logs**:
   ```bash
   bun run dev
   # Watch terminal output for errors
   ```

2. **Test MentraOS connection**:
   - Open MentraOS app on phone
   - Look for your app in the list
   - Check if it connects successfully

3. **Verify API endpoints**:
   ```bash
   # Test app status
   curl http://localhost:3000/
   
   # Test backend connection
   curl http://localhost:8000/
   ```

## 🔒 Security

### Data Handling

- **Photo Storage**: Photos stored locally temporarily
- **API Keys**: Stored securely in environment variables
- **Network**: All communication over HTTPS via ngrok
- **Cleanup**: Temporary files cleaned up after processing

### Best Practices

- Never commit `.env` file to version control
- Use strong, unique API keys
- Regularly rotate API keys
- Monitor for suspicious activity

## 🚀 Deployment

### Local Development
```bash
bun run dev
```

### Production (Railway)
```bash
# Deploy using Railway CLI
railway login
railway link
railway up
```

### Docker
```bash
# Build and run with Docker
docker build -t auratune-mentraos .
docker run -p 3000:3000 auratune-mentraos
```

## 📊 Monitoring

### Key Metrics

- **Photo capture success rate**
- **Backend communication latency**
- **Processing time per photo**
- **Error rates and types**

### Logs to Monitor

- App startup and configuration
- Photo capture events
- Backend API calls
- Error messages and stack traces

## 🔄 Updates and Maintenance

### Regular Tasks

1. **Update dependencies**:
   ```bash
   bun update
   ```

2. **Clean up old photos**:
   ```bash
   rm -rf photos/*
   ```

3. **Monitor disk space**:
   - Check `photos/` directory size
   - Clean up if needed

### Version Updates

- Check for MentraOS API updates
- Update dependencies regularly
- Test with new MentraOS versions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with MentraOS glasses
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MentraOS team for the smart glasses platform
- AuraTune backend for AI processing
- ngrok for secure tunneling
