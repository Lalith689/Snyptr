#!/usr/bin/env python3
"""
Setup script to ensure ML models are available.
This script can be run during deployment to verify/download models.
"""
import os
import shutil

MODEL_FILES = [
    'best_model.h5',
    'stance_error_model.h5'
]

def setup_models():
    """Ensure models exist in the backend directory."""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Setting up ML models...")
    
    for model_file in MODEL_FILES:
        source_path = os.path.join(project_root, model_file)
        dest_path = os.path.join(backend_dir, model_file)
        
        # Check if model already exists in backend
        if os.path.exists(dest_path):
            print(f"✓ {model_file} found in backend/")
            continue
        
        # If not, try to copy from project root
        if os.path.exists(source_path):
            print(f"Copying {model_file} from project root to backend/")
            shutil.copy2(source_path, dest_path)
            print(f"✓ {model_file} copied successfully")
        else:
            print(f"⚠ {model_file} not found. Make sure it's at {source_path}")
            print(f"  The app will use mock predictions if models are unavailable.")

if __name__ == '__main__':
    setup_models()
    print("\nModel setup complete!")
