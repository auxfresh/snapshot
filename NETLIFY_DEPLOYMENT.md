
# Netlify Deployment Guide for SnapShot

## Overview

This guide explains how to deploy your SnapShot application to Netlify. Your app is already configured with the necessary files for Netlify deployment.

## Prerequisites

- Netlify account
- GitHub repository with your code
- Environment variables configured

## Deployment Files

Your project includes these Netlify-specific files:

### 1. `netlify.toml` Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist/public`
- **Functions Directory**: `netlify/functions`
- **API Redirects**: `/api/*` → `/.netlify/functions/api`
- **CORS Headers**: Configured for cross-origin requests

### 2. `netlify/functions/api.js` Serverless Function
- Handles all API endpoints as a single serverless function
- Uses Neon Database for PostgreSQL operations
- Supports Firebase Authentication
- Includes CORS handling

## Environment Variables

Set these environment variables in your Netlify dashboard:

```
DATABASE_URL=your_neon_database_connection_string
SCREENSHOTONE_API_KEY=your_screenshotone_api_key
```

## Deployment Steps

### 1. Connect Repository
1. Log into Netlify dashboard
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository

### 2. Build Settings
Configure these build settings:
- **Base directory**: Leave empty (root)
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`

### 3. Environment Variables
1. Go to Site settings → Environment variables
2. Add your environment variables:
   - `DATABASE_URL`
   - `SCREENSHOTONE_API_KEY`

### 4. Deploy
1. Click "Deploy site"
2. Netlify will automatically build and deploy your app

## How It Works

### Frontend
- Built with Vite and served from `dist/public`
- React app with Tailwind CSS styling
- Firebase Authentication for user management

### Backend (Serverless)
- Single serverless function at `/.netlify/functions/api`
- Handles all API routes via path routing
- Connects to Neon PostgreSQL database
- Supports screenshot capture and user management

### Database
- Uses Neon Database (serverless PostgreSQL)
- Automatically scales with your app
- No connection pooling needed for serverless

## API Endpoints

All API calls are redirected to the serverless function:

- `POST /api/auth/sync-user` - User authentication
- `GET /api/users/:firebaseUid/preferences` - Get user preferences
- `PUT /api/users/:firebaseUid/preferences` - Update preferences
- `POST /api/screenshots/capture` - Capture screenshots
- `GET /api/screenshots` - Get screenshot list
- `GET /api/screenshots/:id` - Get specific screenshot
- `DELETE /api/screenshots/:id` - Delete screenshot
- `GET /api/screenshots/:id/download` - Download screenshot

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Netlify dashboard
   - Ensure all dependencies are in `package.json`
   - Verify build command is correct

2. **Environment Variables**
   - Ensure all required env vars are set
   - Check variable names match exactly
   - Restart deployment after adding variables

3. **Database Connection**
   - Verify DATABASE_URL is correct
   - Check Neon database is accessible
   - Ensure database schema is migrated

4. **API Errors**
   - Check function logs in Netlify dashboard
   - Verify CORS headers are working
   - Test API endpoints individually

### Build Logs
Access build logs through:
1. Netlify dashboard → Site overview → Production deploys
2. Click on deploy to view detailed logs

### Function Logs
Monitor serverless function execution:
1. Netlify dashboard → Functions tab
2. Click on function name to view logs

## Performance Considerations

- **Cold Starts**: Serverless functions may have slight delay on first request
- **Database**: Neon Database automatically scales and hibernates when unused
- **CDN**: Netlify provides global CDN for fast static asset delivery
- **Caching**: Static assets are automatically cached

## Cost Considerations

- **Netlify**: Free tier includes 100GB bandwidth and 125K function invocations
- **Neon Database**: Free tier includes 512MB storage
- **ScreenshotOne**: Check API limits and pricing

## Monitoring

Monitor your deployment through:
- Netlify analytics dashboard
- Function execution logs
- Neon Database dashboard
- Firebase Authentication console

## Alternative: Replit Deployment

**Recommendation**: Consider using Replit's built-in deployment instead, which:
- Works seamlessly with your current setup
- Handles both frontend and backend together
- Requires no serverless function conversion
- Maintains your existing Express.js server architecture

To deploy on Replit, simply use the Deployments tool in your workspace.
