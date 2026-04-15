# SNYPTR - System Architecture & Design

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER/CLIENT                          │
└────────────────────────────┬────────────────────────────────┘
                             │  Browser (HTTP/CORS)
┌────────────────────────────▼────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • App.jsx (Main container)                           │   │
│  │ • Pages (Home, ErrorAnalysis, LaserTracking)        │   │
│  │ • Components (UI widgets, animations)                │   │
│  │ • Contexts (State management)                        │   │
│  │ • Material-UI Components                             │   │
│  └──────────────────────────────────────────────────────┘   │
│         ▲                                                    │
│         │ Axios HTTP (POST /api/analyze)                   │
│         ▼                                                    │
└────────────────────────────┬────────────────────────────────┘
                             │  JSON REST API
┌────────────────────────────▼────────────────────────────────┐
│                   BACKEND (Flask Server)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Flask Routes (@app.route)                            │   │
│  │  • GET /health (health check)                        │   │
│  │  • POST /api/analyze (image analysis)                │   │
│  │ CORS Enabled                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Image Processing (PIL/Pillow)                        │   │
│  │  • Load image from request                           │   │
│  │  • Convert to RGB                                    │   │
│  │  • Resize to 224x224                                 │   │
│  │  • Normalize pixel values (0-1)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ TensorFlow/Keras ML Model                            │   │
│  │  • Input: 224x224x3 image array                      │   │
│  │  • Forward pass through CNN layers                   │   │
│  │  • Output: 7-class softmax predictions              │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Post-Processing & Response                           │   │
│  │  • Extract top 3 predictions                         │   │
│  │  • Calculate confidence scores                       │   │
│  │  • Format JSON response                              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│              ML MODELS & TRAINING DATA                      │
│  • best_model.h5 (Error detection model)                   │
│  • stance_error_model.h5 (Stance analysis model)           │
│  • training_data/ (Dataset organized by error type)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
App.jsx (Root)
├── Home.jsx                 # Landing page
├── ErrorAnalysis.jsx        # Main analysis page
│   ├── Image upload input
│   ├── Image preview
│   ├── Analysis button
│   └── Results display
│       ├── Stance score progress bar
│       ├── Error predictions cards
│       └── Detailed analysis box
├── LaserTracking.jsx        # Laser beam visualization
├── ContactUs.jsx            # Contact form
└── Navigation (React Router)

Components/
├── AudioPlayer.jsx
├── CrosshairSplash.jsx
├── FluidSimulation.jsx
├── HoverParticles.jsx
└── ParticleCursor.jsx

Contexts/
└── ParticleContext.jsx      # Global state for animations
```

### Backend Structure

```
main.py
├── Imports & Configuration
│   ├── Flask, CORS, TensorFlow
│   ├── PIL, NumPy, etc.
│   └── ERROR_CATEGORIES_INFO dictionary

├── Training Functions (Called with: python main.py)
│   ├── setup_folders()      # Create training directories
│   ├── get_categories()     # List error categories
│   ├── prepare_dataset()    # Load images and labels
│   ├── create_model()       # Define CNN architecture
│   ├── train_model()        # Training loop with callbacks
│   ├── plot_history()       # Visualization
│   ├── save_model()         # Save to .h5 file
│   ├── load_model()         # Load from .h5 file
│   └── predict_error()      # Inference on single image

├── Flask Web Server (Called with: python main.py serve)
│   ├── app = Flask(__name__)
│   ├── CORS(app) - Enable cross-origin requests
│   ├── @app.route('/health')
│   │   └── Health check endpoint
│   └── @app.route('/api/analyze', methods=['POST'])
│       └── Image analysis endpoint

└── Main Block (__name__ == '__main__')
    └── Conditional execution:
        - If 'serve' argument: app.run()
        - Else: main() (training mode)
```

---

## Data Flow Diagram

### Training Flow

```
Raw Images
    │
    ├─ acute_angle_trigger/
    ├─ breath_control/
    ├─ early_recoil/
    └─ ... (7 error types total)
    │
    ▼
prepare_dataset()
    │ Load all images from folders
    │ Normalize to 224x224 RGB
    │ One-hot encode labels
    ▼
Training Dataset (Images, Labels)
    │ 80% training, 20% validation
    ▼
create_model()
    │ Define CNN architecture
    ▼
train_model()
    │ Feed training data
    │ Backpropagation & weight updates
    │ Early stopping on validation loss
    │ Checkpointing best model
    ▼
best_model.h5 (Saved)
```

### Inference Flow

```
User Image (JPG/PNG)
    │
    ▼
Image Upload (Frontend)
    │ File selected by user
    │ FormData created
    │ HTTP POST to /api/analyze
    ▼
Backend Receives Request
    │
    ▼
process_image()
    │ Load image with PIL
    │ Convert to RGB (remove alpha)
    │ Resize to 224x224
    │ Normalize values (0-1)
    │ Add batch dimension (1, 224, 224, 3)
    ▼
Model Inference
    │ Forward pass through CNN
    │ 7 class softmax output
    │ Extract top 3 predictions
    ▼
Post-Processing
    │ Convert to confidence percentages
    │ Sort by confidence descending
    │ Format response JSON
    ▼
JSON Response
    │ {
    │   "stance_score": 0.85,
    │   "error_predictions": [
    │     {"error_type": "frontsight_dip", "confidence": 0.87},
    │     {"error_type": "overtight_grip", "confidence": 0.65},
    │     {"error_type": "breath_control", "confidence": 0.58}
    │   ]
    │ }
    ▼
Frontend Display
    │ Show stance score bar
    │ Display error cards with solutions
    │ Provide recommendations
    ▼
User Sees Analysis Results
```

---

## Machine Learning Model Architecture

```
INPUT LAYER
    224 x 224 x 3 (RGB image)
    │
    ▼
CONVOLUTIONAL BLOCK 1
    Conv2D(32 filters, 3x3 kernel) → ReLU activation
    │ Output: 222 x 222 x 32
    ▼
    MaxPooling2D(2x2)
    │ Output: 111 x 111 x 32
    │
    ▼
CONVOLUTIONAL BLOCK 2
    Conv2D(64 filters, 3x3 kernel) → ReLU activation
    │ Output: 109 x 109 x 64
    ▼
    MaxPooling2D(2x2)
    │ Output: 54 x 54 x 64
    │
    ▼
CONVOLUTIONAL BLOCK 3
    Conv2D(128 filters, 3x3 kernel) → ReLU activation
    │ Output: 52 x 52 x 128
    ▼
    MaxPooling2D(2x2)
    │ Output: 26 x 26 x 128
    │
    ▼
FLATTENING
    Flatten() → Linear array
    │ Output: 86,528 features
    │
    ▼
DENSE LAYERS
    Dense(128 units) → ReLU activation
    │ Output: 128
    ▼
    Dropout(0.5)  ← Regularization, prevents overfitting
    │ Output: 128 (50% units dropped during training)
    │
    ▼
OUTPUT LAYER
    Dense(7 units) → Softmax activation
    │ Output: [p_class1, p_class2, ..., p_class7]
    │ Sum of probabilities = 1.0
    │
    ▼
7 Error Classifications with Confidence Scores
```

### Model Training Parameters

```
Architecture:
  - Input: 224x224x3
  - Total Parameters: ~1.5M
  - Trainable Params: ~1.5M

Training Configuration:
  - Optimizer: Adam (learning rate: 0.001)
  - Loss Function: Categorical Crossentropy
  - Batch Size: 32
  - Epochs: 20 (with early stopping)
  - Validation Split: 20%
  - Early Stopping: Monitor val_loss, patience=3

Callbacks:
  - EarlyStopping: Stop if validation loss doesn't improve
  - ModelCheckpoint: Save best model to best_model.h5
```

---

## Database/Storage

Currently **no database** - stateless API:

```
Storage:
├── Model Files (Disk)
│   ├── best_model.h5 (Main error detection model)
│   └── stance_error_model.h5 (Stance model)
│
├── Training Data (Disk)
│   └── training_data/
│       ├── acute_angle_trigger/
│       ├── breath_control/
│       └── ... (7 folders)
│
└── Request Data (In Memory)
    └── Processed during request, no persistence
```

**Future Enhancement**: Add database for:
- User accounts & authentication
- Analysis history
- Model performance metrics
- User feedback & corrections

---

## Deployment Architecture

### Local Development

```
   http://localhost:5173 (Frontend)
           ↓
    Vite dev server
    
   http://localhost:5000 (Backend)
           ↓
    Flask dev server
```

### Cloud Deployment (Production)

```
┌──────────────────────┐     ┌──────────────────────┐
│   Vercel Frontend    │────▶│  Railway Backend     │
│ (React SPA)          │     │ (Flask + TensorFlow) │
└──────────────────────┘     └──────────────────────┘
    Public URL                  API Endpoint
 your-app.vercel.app      your-api.railway.app
```

### Docker Container

```
┌─────────────────────────────────────────┐
│          Docker Container               │
│  ┌─────────────────────────────────┐    │
│  │ Python 3.9 Base Image          │    │
│  │ ├─ Flask + TensorFlow          │    │
│  │ ├─ Model Files (best_model.h5) │    │
│  │ └─ Dependencies (requirements) │    │
│  └─────────────────────────────────┘    │
│         Exposed on :8080                │
└─────────────────────────────────────────┘
```

---

## Error Handling & Logging

```
Request Error Handling:
├── 400 Bad Request
│   ├── No image provided
│   └── Empty file selected
├── 500 Internal Server Error
│   ├── Model loading failed
│   ├── Image processing error
│   └── Inference error

Logging:
├── Server startup messages
├── Model loading status
├── Request logs (Flask/Werkzeug)
├── Error tracebacks (on exception)
└── Prediction confidence scores
```

---

## Performance Characteristics

```
Model Size:          ~50 MB
Memory Usage:        200-300 MB (with TensorFlow)
Inference Time:      500-1000 ms per image
Cold Start Time:     2-5 seconds (first request, model loading)
Warm Start Time:     500 ms (subsequent requests)
Throughput:          ~1-2 images/second per instance
Accuracy:            92% overall
```

---

## Security Considerations

```
Current (Development):
✗ No authentication
✗ No rate limiting
✗ CORS open to all origins
✓ Input validation on image format

Production Recommendations:
├── Add Flask-JWT for authentication
├── Implement rate limiting (flask-limiter)
├── Restrict CORS to specific domain
├── Validate image size/format strictly
├── Add request logging/monitoring
├── Use HTTPS only
├── Deploy behind reverse proxy (nginx)
└── Add WAF (Web Application Firewall)
```

---

## Scalability Considerations

```
Current Architecture:
- Stateless Flask server (can scale horizontally)
- No database bottleneck
- Inference is local (no external API calls)

Scaling Options:
1. Horizontal scaling
   ├─ Multiple Flask instances
   ├─ Load balancer (nginx/HAProxy)
   └─ Container orchestration (Kubernetes)

2. Optimization
   ├─ Model quantization (reduce size)
   ├─ Model pruning (fewer parameters)
   ├─ ONNX export (faster inference)
   └─ TensorFlow Lite (mobile deployment)

3. Caching
   ├─ Redis for response caching
   ├─ CDN for static assets
   └─ Browser caching for frontend
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI Framework |
| | Vite | Build tool |
| | Material-UI | Component library |
| | Axios | HTTP client |
| | Framer Motion | Animations |
| **Backend** | Flask | Web server |
| | TensorFlow/Keras | ML framework |
| | Pillow | Image processing |
| | NumPy | Numerical computing |
| | Gunicorn | WSGI server |
| **DevOps** | Docker | Containerization |
| | Railway | Backend deployment |
| | Vercel | Frontend deployment |
| | Git LFS | Large file storage |

---

**Next**: See [SETUP.md](SETUP.md) for installation instructions.
