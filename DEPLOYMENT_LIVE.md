# SNYPTR Deployment Guide

Complete step-by-step guide to deploy SNYPTR to production.

## Prerequisites

1. GitHub account with repository: https://github.com/Lalith689/Snyptr
2. Railway.app account (https://railway.app)
3. Vercel account (https://vercel.com)

---

## STEP 1: Add Models to Backend (Local Setup)

Before deploying, ensure .h5 model files are in the backend folder:

```
backend/
├── best_model.h5          (copy here)
├── stance_error_model.h5  (copy here)
├── server.py
└── requirements.txt
```

The setup script will handle copying if they're in the project root.

---

## STEP 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to https://railway.app
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Choose "Lalith689/Snyptr" repository
5. Click "Deploy"

### 2.2 Configure Railway

1. In Railway dashboard, click on the project
2. Click "Variables" tab
3. Add environment variables (optional for now):
   ```
   FLASK_ENV=production
   ```

4. Click "Deploy" to start deployment

### 2.3 Get Backend URL

1. Once deployed (green checkmark), click the service
2. Click "Settings" → "Domains"
3. Copy the generated URL (e.g., `https://snyptr-prod-xxxxx.up.railway.app`)
4. **Save this URL** - you'll need it for frontend

### 2.4 Test Backend

```bash
# In terminal or browser, test the health endpoint
curl https://[YOUR_RAILWAY_URL]/health

# Should return:
# {"status": "ok", "models_loaded": true}
```

---

## STEP 3: Deploy Frontend to Vercel

### 3.1 Create Environment File

Create `frontend/.env.production`:

```env
VITE_API_URL=https://[YOUR_RAILWAY_URL]
```

Replace `[YOUR_RAILWAY_URL]` with the URL from Step 2.3 (including https://)

### 3.2 Push to GitHub

```bash
cd /path/to/snypter-lalith

git add backend/setup_models.py backend/Procfile frontend/.env.production
git commit -m "chore: Add deployment files and environment config"
git push origin main
```

### 3.3 Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Search for "Snyptr" and select it
5. Configure project:
   - **Framework**: Vite
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Click "Environment Variables"
7. Add:
   ```
   VITE_API_URL = https://[YOUR_RAILWAY_URL]
   ```

8. Click "Deploy"

### 3.4 Get Frontend URL

Once deployed, Vercel shows your URL:
```
https://snyptr-xxxxxx.vercel.app
```

---

## STEP 4: Test Live Deployment

1. Open frontend URL in browser: `https://snyptr-xxxxxx.vercel.app`
2. Navigate to "Error Analysis" page
3. Upload a test image
4. Verify analysis results display correctly

### Test Backend Directly

```bash
# Test health check
curl https://[YOUR_RAILWAY_URL]/health

# Test with image (using curl or Postman)
curl -X POST https://[YOUR_RAILWAY_URL]/api/analyze \
  -F "image=@test_image.jpg"
```

---

## STEP 5: Configure Custom Domain (Optional)

### Railway Custom Domain
1. Railway dashboard → Settings → Domains
2. Add custom domain (requires DNS setup)

### Vercel Custom Domain
1. Vercel dashboard → Settings → Domains
2. Add domain and follow DNS instructions

---

## Troubleshooting

### Models not loading on Railway

1. Check Railway logs:
   - Dashboard → Service → Logs
   - Look for "Models loaded successfully" or error messages

2. If models fail to load:
   - Railway will use mock predictions (partial functionality)
   - Manually upload .h5 files to Railway storage if available

3. Solution: Upload models to cloud storage and update `server.py` to download from there

### Frontend not connecting to backend

1. Check browser console (F12 → Console tab)
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Check CORS is enabled in backend (should be by default)

### CORS errors

If you get CORS errors, backend already has CORS enabled. If still issues:
- Check backend logs on Railway
- Verify frontend URL can reach backend URL

---

## Environment Variables Summary

### Backend (Railway)
- `FLASK_ENV=production`

### Frontend (Vercel)  
- `VITE_API_URL=https://[YOUR_RAILWAY_URL]`

---

## Important Notes

1. **Model Files**: The .h5 files are ignored by git. They must be:
   - In `backend/` folder locally for development
   - Or downloaded during deployment via setup script
   - Or stored in cloud and fetched by server.py

2. **First Deployment**: May take 2-5 minutes per service

3. **Cold Starts**: First request after inactivity may be slow (Rails/Vercel free tier)

4. **Monitoring**: 
   - Railway: Dashboard shows logs and metrics
   - Vercel: Dashboard shows deployments and analytics

---

## Quick Reference

```
Frontend:  https://snyptr-xxxxxx.vercel.app
Backend:   https://snyptr-prod-xxxxx.up.railway.app
GitHub:    https://github.com/Lalith689/Snyptr
```

🚀 **Deployment complete!** Your app is now live online.
