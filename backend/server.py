from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load models
model_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(model_dir)

# Try to load models from parent directory (where they're committed)
model_path = os.path.join(parent_dir, 'best_model.h5')
stance_path = os.path.join(parent_dir, 'stance_error_model.h5')

print(f"Looking for models in: {parent_dir}")
print(f"Model path: {model_path}")
print(f"Model exists: {os.path.exists(model_path)}")
print(f"Stance model exists: {os.path.exists(stance_path)}")

try:
    if os.path.exists(stance_path):
        stance_model = tf.keras.models.load_model(stance_path)
        print(f"✓ Stance model loaded from {stance_path}")
    else:
        print(f"✗ Stance model not found at {stance_path}")
        stance_model = None
except Exception as e:
    print(f"✗ Error loading stance model: {e}")
    stance_model = None

try:
    if os.path.exists(model_path):
        best_model = tf.keras.models.load_model(model_path)
        print(f"✓ Best model loaded from {model_path}")
    else:
        print(f"✗ Best model not found at {model_path} - Using mock predictions")
        best_model = None
except Exception as e:
    print(f"✗ Error loading best model: {e}")
    print("Using mock predictions instead")
    best_model = None

# Class mappings
error_classes = [
    'acute_angle_trigger',
    'breath_control',
    'early_recoil',
    'frontsight_dip',
    'overtight_grip',
    'stance_position',
    'to and fro motion'
]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Server is running",
        "models_loaded": stance_model is not None and best_model is not None
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Read and preprocess image
        image_file = request.files['image']
        image = Image.open(io.BytesIO(image_file.read()))
        image = image.convert('RGB')
        image = image.resize((224, 224))
        image_array = np.array(image) / 255.0
        
        if best_model and stance_model:
            # Use real models
            image_array_exp = np.expand_dims(image_array, axis=0)
            stance_pred = stance_model.predict(image_array_exp, verbose=0)
            error_pred = best_model.predict(image_array_exp, verbose=0)
            stance_score = float(stance_pred[0][0])
            error_predictions = error_pred[0]
        else:
            # Use mock predictions if models not loaded
            print("Using mock predictions (models not available)")
            stance_score = float(np.random.uniform(0.7, 0.95))
            error_predictions = np.random.dirichlet(np.ones(len(error_classes)))

        # Get top 3 predictions for error types
        top_3_indices = np.argsort(error_predictions)[-3:][::-1]
        top_3_errors = [
            {
                "error_type": error_classes[int(idx)],
                "confidence": float(error_predictions[int(idx)])
            }
            for idx in top_3_indices
        ]

        return jsonify({
            "stance_score": stance_score,
            "error_predictions": top_3_errors,
            "using_real_models": best_model is not None
        })

    except Exception as e:
        print(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
