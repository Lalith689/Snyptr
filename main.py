import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
from PIL import Image
import shutil
from sklearn.model_selection import train_test_split
from flask import Flask, request, jsonify
import tempfile
import traceback

# Default error categories (used to create folders if missing)
DEFAULT_ERROR_CATEGORIES = [
    'frontsight_dip',
    'overtight_grip',
    'acute_angle_trigger',
    'stance_position',
    'breath_control',
    'early_recoil'
]


def setup_folders():
    """Create folders for each error type"""
    base_dir = 'training_data'
    # Do not remove existing training_data to avoid losing user folders
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # Ensure default category folders exist, but don't remove other folders
    for category in DEFAULT_ERROR_CATEGORIES:
        path = os.path.join(base_dir, category)
        if not os.path.exists(path):
            os.makedirs(path)
    print("Ensured training_data and default category folders exist (no deletion performed).")


def get_categories(base_dir='training_data'):
    """Return a sorted list of category folder names inside training_data."""
    if not os.path.exists(base_dir):
        return []
    entries = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]
    # Sort for deterministic ordering
    return sorted(entries)


def upload_images():
    """In local env, place images in folders manually"""
    print("\nPlease manually place your images into the appropriate folders under 'training_data/'.")
    print("Each folder should be named after an error category.")
    input("Press Enter once you're done organizing images...")


def process_image(image_path, target_size=(224, 224)):
    """Process individual images"""
    img = Image.open(image_path)
    img = img.convert('RGB')
    img = img.resize(target_size)
    return np.array(img) / 255.0


def prepare_dataset():
    """Prepare images and labels for training"""
    images = []
    labels = []

    categories = get_categories()
    if not categories:
        raise ValueError("No category folders found in training_data. Please add folders with images.")

    for idx, category in enumerate(categories):
        path = os.path.join('training_data', category)
        if not os.path.exists(path):
            print(f"Warning: Directory {path} does not exist")
            continue

        for img_name in os.listdir(path):
            if img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(path, img_name)
                try:
                    img_array = process_image(img_path)
                    images.append(img_array)
                    # One-hot encoding for categories
                    label = np.zeros(len(categories))
                    label[idx] = 1
                    labels.append(label)
                except Exception as e:
                    print(f"Error processing {img_path}: {e}")

    if not images:
        raise ValueError("No images found in training_data directory. Please add training images.")

    return np.array(images), np.array(labels)


def create_model(input_shape=(224, 224, 3), num_classes=6):
    """Create the CNN model"""
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model


def train_model(model, images, labels, epochs=20, batch_size=32):
    """Train the model with validation split"""
    X_train, X_val, y_train, y_val = train_test_split(
        images, labels, test_size=0.2, random_state=42)

    # Add early stopping to prevent overfitting
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3),
        tf.keras.callbacks.ModelCheckpoint(
            'best_model.h5', save_best_only=True, monitor='val_accuracy')
    ]

    history = model.fit(X_train, y_train,
                        epochs=epochs,
                        batch_size=batch_size,
                        validation_data=(X_val, y_val),
                        callbacks=callbacks)
    return history


def plot_training_history(history):
    """Plot training and validation accuracy/loss"""
    plt.figure(figsize=(12, 4))

    # Plot accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()

    # Plot loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()

    plt.tight_layout()
    plt.show()


def save_model(model, filename='stance_error_model.h5'):
    """Save the trained model"""
    model.save(filename)
    print(f"\nModel saved to {filename}")


def load_model(filename='best_model.h5'):
    """Load a saved model"""
    return models.load_model(filename)


def predict_error(model, image_path):
    """Predict error category for new image.
    Returns (top_category, confidence, is_uncertain).
    """
    try:
        img_array = process_image(image_path)
        img_array = np.expand_dims(img_array, axis=0)
        prediction = model.predict(img_array)

        confidences = prediction[0]
        sorted_indices = np.argsort(confidences)[::-1]  # Sort descending

        categories = get_categories()
        if not categories:
            return None, None, True

        top_idx = sorted_indices[0]
        category = categories[top_idx]
        confidence = confidences[top_idx]

        print("\nConfidence scores for all error types:")
        for idx in sorted_indices:
            error_type = categories[idx]
            print(f"{error_type}: {confidences[idx]:.2%}")

        is_uncertain = confidence < 0.5
        # Always return the top candidate, with a flag indicating low confidence
        return category, float(confidence), bool(is_uncertain)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, None, True


# Error category information
ERROR_CATEGORIES_INFO = {
    'frontsight_dip': {
        'description': 'Incorrect W formed by dip of front sight',
        'solution': 'Work on arm oriented exercises.'
    },
    'overtight_grip': {
        'description': 'Extra pressure exercised on the grip',
        'solution': 'Relax your grip  and hold the gun like giving a handshake.'
    },
    'acute_angle_trigger': {
        'description': 'Rough handling of Trigger',
        'solution': 'Maintain a 90 degree pace with the index finger and the trigger.'
    },
    'stance_position': {
        'description': 'Improper foot positioning or weight distribution',
        'solution': 'Maintain athletic stance with feet shoulder-width apart. Weight slightly forward, knees flexed. Fix your feet parallel to each other and stay directed towards the aiming area.'
    },
    'breath_control': {
        'description': 'Irregular breathing pattern',
        'solution': 'Follow box breathing and practice 4:8 ratio breathing regularly.'
    },
    'early_recoil': {
        'description': 'Pulling the trigger before reaching the target due to anxiety',
        'solution': 'Calm down and cancel shots if the hand is not stable and take regular breaks when needed.'
    }
}


def main():
    # Setup training environment
    print("=== Shooting Form Error Detection Model Training ===")
    print("1. Setting up training environment...")
    setup_folders()
    upload_images()

    # Prepare dataset
    print("\n2. Preparing dataset...")
    try:
        images, labels = prepare_dataset()
        categories = get_categories()
        print(f"\nDataset prepared with {len(images)} images across {len(categories)} categories")
    except ValueError as e:
        print(f"Error: {e}")
        return

    # Create and train model
    print("\n3. Creating and training model...")
    # Create model with the correct number of output classes
    model = create_model(num_classes=len(get_categories()))
    print(model.summary())

    history = train_model(model, images, labels, epochs=20)

    # Plot training results
    print("\n4. Training complete. Showing results...")
    plot_training_history(history)

    # Save the model
    save_model(model)

    # Optional: Test the model
    print("\nWould you like to test the model with new images?")
    while True:
        user_input = input("Enter 'y' to test an image or 'n' to exit: ").lower()
        if user_input == 'n':
            break
        elif user_input == 'y':
            image_path = input("Enter path to image file: ").strip()
            if not os.path.exists(image_path):
                print("Invalid path. Try again.")
                continue

            # Load the best saved model for prediction
            try:
                best_model = load_model('best_model.h5')
                category, confidence, is_uncertain = predict_error(best_model, image_path)

                if category:
                    label_text = category if not is_uncertain else f"{category} (Uncertain)"
                    print(f"\nDetected Error: {label_text}")
                    print(f"Confidence: {confidence:.2%}")

                    # Provide description and solution if available, otherwise a generic fallback
                    info = ERROR_CATEGORIES_INFO.get(category, None)
                    if info:
                        print("\n=== Detailed Analysis ===")
                        print(f"Issue: {info['description']}")
                        print(f"\nSolution: {info['solution']}")
                    else:
                        print("No specific solution available for this error category. Try re-taking the image from a clearer angle.")
            except Exception as e:
                print(f"Error during testing: {e}")
        else:
            print("Please enter 'y' or 'n'.")


app = Flask(__name__)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            file.save(tmp.name)
            image_path = tmp.name

        model = load_model('best_model.h5')
        category, confidence, is_uncertain = predict_error(model, image_path)

        # Fill description/solution even if uncertain
        info = ERROR_CATEGORIES_INFO.get(category, None)
        description = info['description'] if info else 'No specific description available.'
        solution = info['solution'] if info else 'No specific solution available.'

        result = {
            'category': f"{category}{' (Uncertain)' if is_uncertain else ''}",
            'confidence': float(confidence) if confidence is not None else 0.0,
            'description': description,
            'solution': solution
        }
        return jsonify(result)
    except Exception as e:
        print("Error in /api/analyze:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        app.run(host="0.0.0.0", port=5000, debug=True)
    else:
        main()