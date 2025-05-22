# backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import joblib
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

# Get the base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler
model_path = os.path.join(BASE_DIR, 'model_files', 'sleep_quality_model.h5')
scaler_path = os.path.join(BASE_DIR, 'model_files', 'scaler.save')
features_path = os.path.join(BASE_DIR, 'model_files', 'features.pkl')

try:
    # Load model with custom_objects and custom_objects_scope
    with tf.keras.utils.custom_object_scope({'InputLayer': tf.keras.layers.InputLayer}):
        model = tf.keras.models.load_model(model_path, compile=False)
    scaler = joblib.load(scaler_path)
    features = joblib.load(features_path)
except Exception as e:
    print(f"Error loading model files: {str(e)}")
    raise

class SleepData(BaseModel):
    Age: int
    Gender: int  # Male=0, Female=1
    Physical_Activity_Level: float
    Stress_Level: int
    Sleep_Duration: float
    Heart_Rate: float
    Daily_Steps: int
    Sleep_Disorder: int  # None=0, Insomnia=1, Apnea=2

@app.get("/")
def health_check():
    return {"status": "healthy"}

@app.post("/predict")
def predict_sleep(data: SleepData):
    try:
        # Features in correct order
        input_arr = np.array([[data.Age, data.Gender, data.Physical_Activity_Level, data.Stress_Level,
                               data.Sleep_Duration, data.Heart_Rate, data.Daily_Steps, data.Sleep_Disorder]])
        input_scaled = scaler.transform(input_arr)
        pred = float(model.predict(input_scaled, verbose=0)[0][0])
        result = "Good" if pred > 0.5 else "Poor"
        return {
            "quality": result,
            "probability": round(pred * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
