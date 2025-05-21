#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p notebook
mkdir -p model_files

# Ensure model files are in the correct location
if [ ! -f "model_files/sleep_quality_model.h5" ] || [ ! -f "model_files/features.pkl" ] || [ ! -f "model_files/scaler.save" ]; then
    echo "Error: Model files are missing. Please ensure all model files are present in the model_files directory."
    exit 1
fi 