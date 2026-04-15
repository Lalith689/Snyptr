# SNYPTR API Documentation

## Base URL

**Development**: `http://localhost:5000`  
**Production**: `https://snyptr-api.onrender.com` (or your backend URL)

---

## Endpoints

### 1. Health Check

Check if the server is running and models are loaded.

```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Server is running",
  "models_loaded": true
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### 2. Analyze Image

Detect shooting form errors in an uploaded image.

```
POST /api/analyze
```

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `image` (file): JPG, PNG, or JPEG image file

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "image=@path/to/image.jpg"
```

**Example (JavaScript/Axios):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await axios.post(
  'http://localhost:5000/api/analyze',
  formData
);
console.log(response.data);
```

**Example (Python/Requests):**
```python
import requests

with open('image.jpg', 'rb') as img:
    files = {'image': img}
    response = requests.post(
        'http://localhost:5000/api/analyze',
        files=files
    )
    print(response.json())
```

**Success Response (200):**
```json
{
  "stance_score": 0.85,
  "error_predictions": [
    {
      "error_type": "frontsight_dip",
      "confidence": 0.87
    },
    {
      "error_type": "overtight_grip",
      "confidence": 0.65
    },
    {
      "error_type": "breath_control",
      "confidence": 0.58
    }
  ]
}
```

**Error Responses:**

```json
// 400 Bad Request - No image provided
{
  "error": "No image provided"
}

// 400 Bad Request - Empty file
{
  "error": "No selected file"
}

// 500 Internal Server Error
{
  "error": "Error message details"
}
```

---

## Response Data Format

### Stance Score
- **Type**: Float (0.0 - 1.0)
- **Description**: Overall stance assessment score
- **Interpretation**:
  - 0.9-1.0: Excellent form
  - 0.7-0.9: Good form with minor issues
  - 0.5-0.7: Moderate issues detected
  - Below 0.5: Major issues

### Error Predictions
- **Type**: Array of objects
- **Contains**: Up to 3 top predicted errors

### Error Type
Possible error categories:
1. `acute_angle_trigger` - Trigger finger at acute angle
2. `breath_control` - Improper breathing during shot
3. `early_recoil` - Anticipating recoil before shot
4. `frontsight_dip` - Front sight dips during trigger break
5. `overtight_grip` - Excessive grip tension
6. `stance_position` - Improper body stance
7. `to and fro motion` - Unnecessary back-and-forth movement

### Confidence Score
- **Type**: Float (0.0 - 1.0)
- **Description**: Confidence in error prediction
- **Interpretation**:
  - 0.8-1.0: Very confident detection
  - 0.6-0.8: Confident detection
  - 0.4-0.6: Moderate confidence
  - Below 0.4: Low confidence (error may not be present)

---

## Error Solutions (Frontend Mapping)

Each detected error includes solutions on the frontend:

```javascript
const errorDetails = {
  'acute_angle_trigger': {
    title: 'Acute Angle Trigger',
    description: 'Trigger finger is at an acute angle during the trigger press.',
    solution: 'Keep your trigger finger straight and perpendicular to the trigger.'
  },
  'breath_control': {
    title: 'Breath Control',
    description: 'Improper breathing technique detected.',
    solution: 'Take a deep breath, let it out halfway, hold your breath, then take the shot.'
  },
  // ... etc for other error types
}
```

---

## CORS Configuration

The API has CORS enabled for development:

```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

For production, restrict to your frontend domain:

```python
CORS(app, resources={r"/*": {"origins": "your-frontend-domain.com"}})
```

---

## Rate Limiting (Future)

Currently no rate limiting. Production deployments should implement:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

---

## Authentication (Future)

Current version has no authentication. For production:

```python
from flask_jwt_extended import jwt_required

@app.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze():
    # Protected endpoint
    pass
```

---

## Integration Examples

### React Component

```jsx
import axios from 'axios';
import { useState } from 'react';

function ErrorAnalyzer() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (imageFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(
        'http://localhost:5000/api/analyze',
        formData
      );

      setResult(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Analyzing...</p>}
      {error && <p>Error: {error}</p>}
      {result && (
        <div>
          <p>Stance Score: {(result.stance_score * 100).toFixed(1)}%</p>
          {result.error_predictions.map((pred) => (
            <p key={pred.error_type}>
              {pred.error_type}: {(pred.confidence * 100).toFixed(1)}%
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Python Client

```python
import requests

def analyze_shooting_form(image_path):
    """Analyze shooting form from image file"""
    url = 'http://localhost:5000/api/analyze'
    
    with open(image_path, 'rb') as img:
        files = {'image': img}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Stance Score: {data['stance_score']:.2%}")
        for error in data['error_predictions']:
            print(f"  - {error['error_type']}: {error['confidence']:.2%}")
    else:
        print(f"Error: {response.json()['error']}")

# Usage
analyze_shooting_form('target.jpg')
```

---

## Deployment Considerations

### Environment Variables

```bash
# Backend
export FLASK_ENV=production
export FLASK_DEBUG=0

# Frontend (if different domain)
export VITE_API_URL=https://your-backend-url.com
```

### Timeouts

For large images or slow connections, set appropriate timeouts:

```javascript
// Frontend
axios.post('/api/analyze', formData, {
  timeout: 30000 // 30 seconds
});
```

### Model Loading

Models are cached after first load. First request may take longer (especially on cold start).

Expected response times:
- First request: 2-5 seconds (model loading + inference)
- Subsequent requests: 0.5-1.5 seconds

---

## Troubleshooting

### 404 Endpoint Not Found
- Ensure backend is running: `python main.py serve`
- Check URL is correct
- Verify CORS is enabled

### 500 Internal Server Error
- Check server logs for detailed error
- Verify image format is supported (JPG, PNG, JPEG)
- Ensure models are loaded

### CORS Error
- Check backend is running
- Verify frontend URL in CORS configuration
- Test with curl first: `curl http://localhost:5000/health`

### Timeout
- Increase timeout in client code
- Check server performance
- Try smaller image file

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | April 2026 | Initial release with 2 endpoints |

---

**For more information, see [README.md](../README.md) or [ARCHITECTURE.md](ARCHITECTURE.md)**
