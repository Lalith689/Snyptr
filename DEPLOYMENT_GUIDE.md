# SNYPTR - Complete Deployment Guide 🚀

## **PART 1: PUSH CODE TO GITHUB**

### **Step 1.1: Commit and Push Changes**

Your repository is ready. Push to GitHub:

```powershell
cd c:\Users\lalit\OneDrive\Desktop\snypter-lalith

# Check current status
git status

# Stage all changes (except venv310 - it's in .gitignore)
git add .

# Commit
git commit -m "chore: Deploy project with documentation"

# Push to GitHub
git push origin main
```

**Note:** If push fails due to venv310 files, that's okay - those shouldn't be in git anyway. The important code will push fine.

---

## **PART 2: BACKEND DEPLOYMENT (Flask API)**

### **Option A: Deploy to Railway.app (RECOMMENDED - EASIEST)**

#### **Step 2.1: Prepare Backend**

Your backend is production-ready:
- ✅ `server.py` - Flask API configured
- ✅ `requirements.txt` - All dependencies listed
- ✅ `Procfile` - Ready for deployment
- ✅ Model files: `best_model.h5` and `stance_error_model.h5`

#### **Step 2.2: Deploy to Railway**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your `Snyptr` repository
5. Railway auto-detects Python and builds it
6. Wait for deployment to complete
7. **Copy your backend URL** → looks like: `https://your-app.up.railway.app`

---

### **Option B: Deploy to Heroku (Alternative)**

1. Install Heroku CLI
2. Login:
   ```powershell
   heroku login
   ```
3. Create app:
   ```powershell
   heroku create your-app-name
   heroku config:set PYTHONUNBUFFERED=1
   git push heroku main
   ```

---

## **PART 3: FRONTEND DEPLOYMENT (React App)**

### **Option A: Deploy to Vercel (RECOMMENDED)**

#### **Step 3.1: Update Frontend Configuration**

Edit `frontend/src/pages/ErrorAnalysis.jsx` or wherever API calls happen:

Find the API URL and update it:
```javascript
// Update API endpoint to your deployed backend
const API_URL = 'https://your-backend-url.up.railway.app'
```

#### **Step 3.2: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select the `Snyptr` repository
5. Configure:
   - **Framework:** Vite
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```

7. Deploy!

**Your live app URL:**
```
https://your-project.vercel.app
```

---

### **Option B: Deploy to Netlify (Alternative)**

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub and select `Snyptr`
4. Configure:
   - **Base Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Deploy!

---

## **PART 4: TESTING DEPLOYMENT**

### **Test Backend:**
```
Open in browser: https://your-backend-url/health

Response should be:
{"status": "healthy", "message": "Server is running"}
```

### **Test Frontend:**
- Open `https://your-frontend.vercel.app`
- Navigate through pages
- Upload an image for analysis
- Check browser console for errors

### **Check Logs:**
- **Railway:** Dashboard → Deployments → View Logs
- **Vercel:** Dashboard → Project → Deployments → Logs

---

## **PART 5: TROUBLESHOOTING**

### **Models Not Found:**
✅ Ensure `best_model.h5` and `stance_error_model.h5` are in `backend/` folder AND committed to GitHub

### **CORS Errors:**
✅ Already configured in `server.py`
✅ Both apps must use HTTPS in production

### **Frontend Can't Reach Backend:**
✅ Check VITE_API_URL environment variable in Vercel
✅ Verify backend is running
✅ Ensure no trailing slash in URL

### **Deployment Fails:**
✅ Check deployment platform logs
✅ Verify `requirements.txt` has all packages
✅ Python version 3.8+?

---

## **COMPLETE CHECKLIST**

- [ ] Code pushed to GitHub
- [ ] Backend deployed (Railway or Heroku)
- [ ] Backend URL obtained
- [ ] Frontend API URL updated
- [ ] Frontend deployed (Vercel or Netlify)
- [ ] Both apps accessible via HTTPS
- [ ] Health check endpoint works
- [ ] Image analysis works

---

## **QUICK REFERENCE**

```
GitHub:          https://github.com/Lalith689/Snyptr
Backend API:     https://your-backend.up.railway.app
Frontend App:    https://your-frontend.vercel.app
Health Check:    https://your-backend.up.railway.app/health
```

---

**Total deployment time: ~20-30 minutes** ⏱️

Good luck! 🎯
