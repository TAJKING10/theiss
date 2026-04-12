"""
Body Language Detection API — Port 8001
Accepts webcam frames (base64 JPEG), returns body language + posture analysis
Uses: MediaPipe Tasks (PoseLandmarker + FaceLandmarker) + trained Random Forest
"""

import os, pickle, warnings, base64
from contextlib import asynccontextmanager
import numpy as np
import cv2
from mediapipe import Image, ImageFormat
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

warnings.filterwarnings("ignore")

# ─── Paths ────────────────────────────────────────────────────────────────────
DIR        = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(DIR, "body_language_model.pkl")
LABELS_PATH= os.path.join(DIR, "body_language_labels.pkl")
MAP_PATH   = os.path.join(DIR, "body_language_interview_map.pkl")
NFEAT_PATH = os.path.join(DIR, "body_language_nfeatures.pkl")
POSE_MODEL = os.path.join(DIR, "models", "pose_landmarker.task")
FACE_MODEL = os.path.join(DIR, "models", "face_landmarker.task")

# ─── Globals ──────────────────────────────────────────────────────────────────
model        = None
labels       = []
interview_info = {}
n_features   = 1533
pose_lm      = None
face_lm      = None

# ─── Display fallback ─────────────────────────────────────────────────────────
DEFAULT_DISPLAY = {
    "Confident":    {"emoji":"😎","color":"green", "score":90,"tip":"Great confident body language"},
    "Enthusiastic": {"emoji":"🌟","color":"blue",  "score":88,"tip":"Showing great enthusiasm"},
    "Surprised":    {"emoji":"😲","color":"blue",  "score":70,"tip":"Reacting to the question"},
    "Confused":     {"emoji":"🤔","color":"yellow","score":55,"tip":"Candidate seems uncertain"},
    "Nervous":      {"emoji":"😰","color":"yellow","score":50,"tip":"Signs of nervousness detected"},
    "Stressed":     {"emoji":"😤","color":"red",   "score":40,"tip":"Stress visible in posture"},
    "Disengaged":   {"emoji":"😔","color":"red",   "score":30,"tip":"Low engagement detected"},
}
POSTURE_TIP  = {"good":"Good upright posture","leaning":"Candidate is leaning","slouching":"Slouching detected","unknown":"Posture unclear"}
POSTURE_SCORE= {"good":100,"leaning":70,"slouching":50,"unknown":60}


# ─── MediaPipe helpers ────────────────────────────────────────────────────────

def init_landmarkers():
    global pose_lm, face_lm
    pose_opts = mp_vision.PoseLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=POSE_MODEL),
        running_mode=mp_vision.RunningMode.IMAGE,
        num_poses=1,
        min_pose_detection_confidence=0.4,
        min_pose_presence_confidence=0.4,
        min_tracking_confidence=0.4,
    )
    face_opts = mp_vision.FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=FACE_MODEL),
        running_mode=mp_vision.RunningMode.IMAGE,
        num_faces=1,
        min_face_detection_confidence=0.4,
        min_face_presence_confidence=0.4,
        min_tracking_confidence=0.4,
    )
    pose_lm = mp_vision.PoseLandmarker.create_from_options(pose_opts)
    face_lm = mp_vision.FaceLandmarker.create_from_options(face_opts)


def extract_features(frame_bgr: np.ndarray):
    """Returns (feature_vector, posture_info) or (None, info)."""
    rgb    = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    mp_img = Image(image_format=ImageFormat.SRGB, data=rgb)

    pose_res = pose_lm.detect(mp_img)
    face_res = face_lm.detect(mp_img)

    posture = {
        "face_visible":  bool(face_res.face_landmarks),
        "eye_contact":   False,
        "posture":       "unknown",
        "head_position": "centered",
        "gesturing":     False,
    }

    if pose_res.pose_landmarks:
        lms  = pose_res.pose_landmarks[0]
        ls, rs = lms[11], lms[12]
        lh, rh = lms[23], lms[24]
        nose   = lms[0]

        lean  = abs((ls.x + rs.x) / 2 - (lh.x + rh.x) / 2)
        sdiff = abs(ls.y - rs.y)
        posture["posture"] = "leaning" if lean > 0.12 else "slouching" if sdiff > 0.05 else "good"

        if   nose.x < 0.4: posture["head_position"] = "left"
        elif nose.x > 0.6: posture["head_position"] = "right"
        elif nose.y < 0.3: posture["head_position"] = "up"
        elif nose.y > 0.7: posture["head_position"] = "down"

        posture["eye_contact"] = (posture["head_position"] == "centered")

    if not pose_res.pose_landmarks or not face_res.face_landmarks:
        return None, posture

    pose_feats = np.array([[lm.x,lm.y,lm.z] for lm in pose_res.pose_landmarks[0]]).flatten()
    face_feats = np.array([[lm.x,lm.y,lm.z] for lm in face_res.face_landmarks[0]]).flatten()
    feats = np.concatenate([pose_feats, face_feats]).astype(np.float32)
    return feats, posture


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, labels, interview_info, n_features

    if not os.path.exists(MODEL_PATH):
        raise RuntimeError("Body language model not found. Run: python emotion_service/train_body_language.py")

    with open(MODEL_PATH,  "rb") as f: model         = pickle.load(f)
    with open(LABELS_PATH, "rb") as f: labels        = pickle.load(f)
    with open(MAP_PATH,    "rb") as f: interview_info = pickle.load(f)
    if os.path.exists(NFEAT_PATH):
        with open(NFEAT_PATH,"rb") as f: n_features  = pickle.load(f)

    init_landmarkers()
    print(f"Body language API ready. Classes: {labels} | Features: {n_features}")
    yield

    if pose_lm: pose_lm.close()
    if face_lm: face_lm.close()


# ─── FastAPI ──────────────────────────────────────────────────────────────────

app = FastAPI(title="Body Language API", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class FrameRequest(BaseModel):
    image: str  # base64 JPEG


class BodyLanguageResponse(BaseModel):
    raw_class: str
    label: str
    emoji: str
    color: str
    tip: str
    confidence: float
    body_language_score: int
    all_scores: dict[str, float]
    posture: str
    posture_score: int
    posture_tip: str
    eye_contact: bool
    head_position: str
    gesturing: bool
    face_visible: bool


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None, "classes": labels}


@app.post("/predict", response_model=BodyLanguageResponse)
async def predict(req: FrameRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        img_data = base64.b64decode(req.image)
        nparr    = np.frombuffer(img_data, np.uint8)
        frame    = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bad image: {e}")

    feats, posture = extract_features(frame)

    if feats is None:
        return BodyLanguageResponse(
            raw_class="Unknown", label="Not Detected",
            emoji="👤", color="gray", tip="No person detected",
            confidence=0.0, body_language_score=0, all_scores={},
            posture=posture["posture"], posture_score=0, posture_tip="No pose detected",
            eye_contact=False, head_position="unknown",
            gesturing=False, face_visible=False,
        )

    X          = pd.DataFrame([feats])
    raw_class  = str(model.predict(X)[0])
    proba      = model.predict_proba(X)[0]
    all_scores = {str(lbl): round(float(p)*100, 1) for lbl, p in zip(model.classes_, proba)}
    confidence = round(float(max(proba)) * 100, 1)

    display = interview_info.get(raw_class, DEFAULT_DISPLAY.get(raw_class, {
        "emoji":"😐","color":"gray","score":60,"tip":"Body language detected"
    }))

    base_score = display["score"]
    bl_score   = round(base_score * (confidence/100) * 0.6 + base_score * 0.4)
    if posture["eye_contact"]:          bl_score = min(100, bl_score + 8)
    if posture["posture"] == "good":    bl_score = min(100, bl_score + 7)
    if posture["gesturing"]:            bl_score = min(100, bl_score + 3)

    return BodyLanguageResponse(
        raw_class=raw_class,
        label=raw_class,
        emoji=display["emoji"],
        color=display["color"],
        tip=display["tip"],
        confidence=confidence,
        body_language_score=int(bl_score),
        all_scores=all_scores,
        posture=posture["posture"],
        posture_score=POSTURE_SCORE.get(posture["posture"], 60),
        posture_tip=POSTURE_TIP.get(posture["posture"], ""),
        eye_contact=posture["eye_contact"],
        head_position=posture["head_position"],
        gesturing=posture["gesturing"],
        face_visible=posture["face_visible"],
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("body_language_api:app", host="0.0.0.0", port=8001, reload=False)
