# API Integration Guide

## Backend API Endpoints

Your Flask backend provides these endpoints:

### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "message": "Server is running"
}
```

### 2. Image Analysis
```
POST /api/analyze
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
```json
{
  "stance_score": 0.94,
  "error_predictions": [
    {
      "error_type": "frontsight_dip",
      "confidence": 0.87
    },
    ...
  ]
}
```

---

## Frontend Integration

### Using Axios
```javascript
import axios from 'axios';

const API_URL = 'https://your-backend.up.railway.app';

// Analyze image
async function analyzeImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await axios.post(
    `${API_URL}/api/analyze`,
    formData
  );
  
  return response.data;
}
```

### React Component Example
```jsx
import { useState } from 'react';

export default function ImageAnalyzer() {
  const [results, setResults] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(
      'https://your-backend.up.railway.app/api/analyze',
      { method: 'POST', body: formData }
    );
    
    setResults(await response.json());
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {results && (
        <div>
          <p>Stance Score: {(results.stance_score * 100).toFixed(2)}%</p>
          {results.error_predictions.map(error => (
            <p key={error.error_type}>
              {error.error_type}: {(error.confidence * 100).toFixed(2)}%
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Error Classes

Your model recognizes:
1. acute_angle_trigger
2. breath_control  
3. early_recoil
4. frontsight_dip
5. overtight_grip
6. stance_position
7. to and fro motion

---

## Local Testing

```powershell
# Start backend
cd backend
python server.py
# Runs on http://localhost:5000

# Start frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Test in browser console:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log)
```

---

## Environment Setup

### Frontend .env variables:
```
VITE_API_URL=https://your-backend-url
```

### Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## CORS Configuration

Already enabled in `server.py`:
```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

In production, restrict to your domain if needed.
