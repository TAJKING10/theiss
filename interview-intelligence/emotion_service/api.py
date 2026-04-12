"""
Speech Emotion Recognition - FastAPI Server
Listens on port 8000, accepts audio blobs, returns emotion + confidence
"""

import os
import io
import pickle
import tempfile
from contextlib import asynccontextmanager
import numpy as np
import librosa
import soundfile as sf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Load Model ───────────────────────────────────────────────────────────────

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(MODEL_DIR, "emotion_model.pkl")
LABELS_PATH = os.path.join(MODEL_DIR, "emotion_labels.pkl")

model = None
labels = []

def load_model():
    global model, labels
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            "Model not found. Run: python emotion_service/train_model.py"
        )
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, "rb") as f:
            labels = pickle.load(f)
    print(f"Emotion model loaded. Labels: {labels}")

# ─── Feature Extraction (must match training) ─────────────────────────────────

def extract_features(y: np.ndarray, sr: int) -> np.ndarray:
    features = []

    # 1. MFCCs
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    features.extend(np.mean(mfcc, axis=1))
    features.extend(np.std(mfcc, axis=1))

    # 2. Chroma
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    features.extend(np.mean(chroma, axis=1))

    # 3. Mel spectrogram
    mel = librosa.feature.melspectrogram(y=y, sr=sr)
    features.extend(np.mean(mel, axis=1))

    # 4. Spectral contrast
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    features.extend(np.mean(contrast, axis=1))

    # 5. ZCR
    zcr = librosa.feature.zero_crossing_rate(y)
    features.append(np.mean(zcr))
    features.append(np.std(zcr))

    # 6. RMS energy
    rms = librosa.feature.rms(y=y)
    features.append(np.mean(rms))
    features.append(np.std(rms))

    # 7. Spectral rolloff
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    features.append(np.mean(rolloff))

    return np.array(features, dtype=np.float32)


# ─── Emotion Descriptions ─────────────────────────────────────────────────────

EMOTION_INFO = {
    "relaxed": {
        "label":       "Relaxed",
        "emoji":       "😊",
        "color":       "green",
        "description": "Candidate appears calm and composed",
    },
    "happy": {
        "label":       "Happy",
        "emoji":       "😄",
        "color":       "blue",
        "description": "Candidate shows enthusiasm and positivity",
    },
    "stressed": {
        "label":       "Stressed",
        "emoji":       "😤",
        "color":       "red",
        "description": "Candidate may be feeling pressure or frustration",
    },
    "nervous": {
        "label":       "Nervous",
        "emoji":       "😰",
        "color":       "yellow",
        "description": "Candidate shows signs of anxiety or uncertainty",
    },
}

# ─── FastAPI App ──────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield

app = FastAPI(title="Speech Emotion API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmotionResponse(BaseModel):
    emotion: str
    label: str
    emoji: str
    color: str
    description: str
    confidence: float
    all_scores: dict[str, float]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None, "labels": labels}


@app.post("/predict", response_model=EmotionResponse)
async def predict_emotion(audio: UploadFile = File(...)):
    """
    Accept a WAV/WebM/OGG audio file and return the detected emotion.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        contents = await audio.read()

        # Write to temp file so librosa can read it
        suffix = ".wav"
        if audio.filename:
            ext = os.path.splitext(audio.filename)[1].lower()
            if ext in [".webm", ".ogg", ".mp4", ".m4a"]:
                suffix = ext

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        try:
            y, sr = librosa.load(tmp_path, sr=22050, duration=5.0, mono=True)
        finally:
            os.unlink(tmp_path)

        if len(y) < sr * 0.3:
            raise HTTPException(status_code=400, detail="Audio too short (min 0.3s)")

        # Extract features
        features = extract_features(y, sr).reshape(1, -1)

        # Predict
        emotion = model.predict(features)[0]
        proba   = model.predict_proba(features)[0]
        class_labels = model.classes_

        all_scores = {
            lbl: round(float(prob) * 100, 1)
            for lbl, prob in zip(class_labels, proba)
        }
        confidence = round(float(max(proba)) * 100, 1)

        info = EMOTION_INFO.get(emotion, {
            "label":       emotion.capitalize(),
            "emoji":       "😐",
            "color":       "gray",
            "description": "",
        })

        return EmotionResponse(
            emotion=emotion,
            label=info["label"],
            emoji=info["emoji"],
            color=info["color"],
            description=info["description"],
            confidence=confidence,
            all_scores=all_scores,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
