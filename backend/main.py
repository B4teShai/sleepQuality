# backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import joblib

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load model and scaler
model = tf.keras.models.load_model('../notebook/sleep_quality_model.h5')
scaler = joblib.load('../notebook/scaler.save')
features = joblib.load('../notebook/features.pkl')

class SleepData(BaseModel):
    Age: int
    Gender: int  # Male=0, Female=1
    Physical_Activity_Level: float
    Stress_Level: int
    Sleep_Duration: float
    Heart_Rate: float
    Daily_Steps: int
    Sleep_Disorder: int  # None=0, Insomnia=1, Apnea=2

@app.post("/predict")
def predict_sleep(data: SleepData):
    try:
        # Features in correct order
        input_arr = np.array([[data.Age, data.Gender, data.Physical_Activity_Level, data.Stress_Level,
                               data.Sleep_Duration, data.Heart_Rate, data.Daily_Steps, data.Sleep_Disorder]])
        input_scaled = scaler.transform(input_arr)
        pred = float(model.predict(input_scaled)[0][0])
        result = "Good" if pred > 0.5 else "Poor"
        return {
            "quality": result,
            "probability": round(pred * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
