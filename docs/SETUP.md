# SNYPTR - Complete Setup Guide

## System Requirements

- **OS**: Windows 10/11, macOS, or Linux
- **Python**: 3.10 or higher
- **Node.js**: 16.x or higher
- **RAM**: 4GB minimum (8GB recommended)
- **GPU**: Optional (for faster training)

---

## 1. Clone Repository

```bash
git clone https://github.com/Lalith689/Snyptr.git
cd Snyptr
```

---

## 2. Backend Setup

### 2.1 Create Virtual Environment

**Windows:**
```powershell
python -m venv venv310
.\venv310\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python3 -m venv venv310
source venv310/bin/activate
```

### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `numpy` - Numerical computing
- `tensorflow` - ML/DL framework
- `flask` - Web server
- `flask-cors` - Cross-origin requests
- `pillow` - Image processing
- `scikit-learn` - ML utilities

### 2.3 Verify Installation

```bash
python -c "import tensorflow as tf; print(f'TensorFlow version: {tf.__version__}')"
```

Expected output: `TensorFlow version: 2.x.x`

---

## 3. Frontend Setup

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Node Packages

```bash
npm install
```

This installs React, Vite, Material-UI, Axios, and other dependencies.

### 3.3 Create Environment File

Create `.env.development` in `frontend/` folder:

```
VITE_API_URL=http://localhost:5000
```

---

## 4. Running the Application

### Terminal 1: Start Backend

```bash
# From project root
python main.py serve
```

Expected output:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

### Terminal 2: Start Frontend

```bash
# From frontend folder
npm run dev
```

Expected output:
```
✓ 1234 packages in 2.4s
VITE v4.3.0  ready in 234 ms
➜  Local:   http://localhost:5173/
```

### Open in Browser

Visit: **http://localhost:5173**

---

## 5. Test the System

1. Click **"Error Analysis"** page
2. Upload a shooting target image
3. Click **"Analyze"**
4. See error detection results

---

## 6. Project Structure (After Setup)

```
Snyptr/
├── main.py                    # Main Flask server script
├── requirements.txt           # Python dependencies
├── frontend/
│   ├── src/
│   ├── package.json          # Node dependencies
│   ├── .env.development      # Local environment variables
│   └── vite.config.js        # Vite config
├── best_model.h5             # Trained ML model
├── stance_error_model.h5     # Stance detection model
└── training_data/            # Dataset organized by error type
```

---

## 7. Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'tensorflow'"

**Solution:**
```bash
pip install --upgrade tensorflow
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti :5000 | xargs kill -9
```

### Issue: CORS Error in Browser Console

**Solution:** Make sure backend is running on `http://localhost:5000`

### Issue: "Cannot find module 'react'"

**Solution:**
```bash
cd frontend
npm install
```

### Issue: Port 5173 (Vite) not accessible

**Solution:**
```bash
# Kill any process using 5173
# Then restart: npm run dev
```

---

## 8. Building for Production

### Backend Build

```bash
# No build needed, Flask runs as-is
# For deployment, use Gunicorn:
gunicorn main:app
```

### Frontend Build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/` folder (ready to deploy)

---

## 9. Environment Variables

### Development (.env.development)
```
VITE_API_URL=http://localhost:5000
```

### Production (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

---

## 10. Next Steps

1. **Train the model**: `python main.py` (if retraining)
2. **Deploy backend**: See [DEPLOYMENT_LIVE.md](../DEPLOYMENT_LIVE.md)
3. **Deploy frontend**: Push to Vercel or Netlify
4. **Monitor logs**: Check backend server output

---

## 11. Useful Commands

```bash
# Activate virtual environment (Windows)
.\venv310\Scripts\Activate.ps1

# Deactivate virtual environment
deactivate

# Update Python packages
pip install --upgrade -r requirements.txt

# Install new package
pip install package_name

# Freeze current environment
pip freeze > requirements.txt

# Run frontend build
npm run build

# Preview production build locally
npm run preview

# Stop running servers
Ctrl + C
```

---

## 12. Documentation Links

- [API Documentation](API.md) - API endpoints and usage
- [Architecture Overview](ARCHITECTURE.md) - System design
- [Deployment Guide](../DEPLOYMENT_LIVE.md) - Deploy to production

---

**For support or issues, open a GitHub issue or contact the author.**
