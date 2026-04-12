"""
Body Language Detection - Train from Video Files (MediaPipe Tasks API)
Dataset: Body-Language-Detection-with-MediaPipe-and-OpenCV-main/Video Decoder/
Features: pose landmarks (33×3) + face landmarks (478×3) = 99 + 1434 = 1533
Classes: Angry->Stressed, Confused, Depressed->Disengaged, Excited->Enthusiastic,
         Happy->Confident, Sad->Disengaged, Scared->Nervous, Serious->Confident,
         Surprised, Tension->Nervous
"""

import os, sys, pickle, warnings
import numpy as np
import cv2
from mediapipe import Image, ImageFormat
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

warnings.filterwarnings("ignore")

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE     = os.path.dirname(os.path.abspath(__file__))
PROJ     = os.path.join(BASE, "..")
VIDEO_DIR = os.path.normpath(os.path.join(
    PROJ, "..",
    "Body-Language-Detection-with-MediaPipe-and-OpenCV-main",
    "Video Decoder"
))
MODELS_DIR = os.path.join(BASE, "models")
POSE_MODEL = os.path.join(MODELS_DIR, "pose_landmarker.task")
FACE_MODEL = os.path.join(MODELS_DIR, "face_landmarker.task")

# ─── Label Mapping ────────────────────────────────────────────────────────────
VIDEO_CLASS_MAP = {
    "angry.mp4":    "Stressed",
    "confused.mp4": "Confused",
    "depressed.mp4":"Disengaged",
    "excited.mp4":  "Enthusiastic",
    "happy.mp4":    "Confident",
    "sad.mp4":      "Disengaged",
    "scared.mp4":   "Nervous",
    "serious.mp4":  "Confident",
    "surprised.mp4":"Surprised",
    "tension.mp4":  "Nervous",
}

INTERVIEW_INFO = {
    "Confident":    {"emoji":"😎","color":"green", "score":90,"tip":"Great confident body language"},
    "Enthusiastic": {"emoji":"🌟","color":"blue",  "score":88,"tip":"Showing great enthusiasm"},
    "Surprised":    {"emoji":"😲","color":"blue",  "score":70,"tip":"Reacting to the question"},
    "Confused":     {"emoji":"🤔","color":"yellow","score":55,"tip":"Candidate seems uncertain"},
    "Nervous":      {"emoji":"😰","color":"yellow","score":50,"tip":"Signs of nervousness detected"},
    "Stressed":     {"emoji":"😤","color":"red",   "score":40,"tip":"Stress visible in posture"},
    "Disengaged":   {"emoji":"😔","color":"red",   "score":30,"tip":"Low engagement detected"},
}

# ─── Feature Extraction ───────────────────────────────────────────────────────

def make_landmarkers():
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
    return (
        mp_vision.PoseLandmarker.create_from_options(pose_opts),
        mp_vision.FaceLandmarker.create_from_options(face_opts),
    )


def extract_features(frame_bgr: np.ndarray, pose_lm, face_lm) -> np.ndarray | None:
    """Extract pose (33×3) + face (478×3) = 1533 features from a BGR frame."""
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    mp_img = Image(image_format=ImageFormat.SRGB, data=rgb)

    pose_res = pose_lm.detect(mp_img)
    face_res = face_lm.detect(mp_img)

    if not pose_res.pose_landmarks or not face_res.face_landmarks:
        return None

    pose_feats = np.array([
        [lm.x, lm.y, lm.z]
        for lm in pose_res.pose_landmarks[0]
    ]).flatten()  # 33×3 = 99

    face_feats = np.array([
        [lm.x, lm.y, lm.z]
        for lm in face_res.face_landmarks[0]
    ]).flatten()  # 478×3 = 1434

    return np.concatenate([pose_feats, face_feats]).astype(np.float32)  # 1533


def extract_posture(frame_bgr: np.ndarray, pose_lm, face_lm) -> dict:
    """Extract posture metadata for interview analysis."""
    rgb    = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    mp_img = Image(image_format=ImageFormat.SRGB, data=rgb)
    pose_res = pose_lm.detect(mp_img)
    face_res = face_lm.detect(mp_img)

    info = {
        "face_visible": bool(face_res.face_landmarks),
        "eye_contact": False,
        "posture": "unknown",
        "head_position": "centered",
        "gesturing": False,
    }

    if pose_res.pose_landmarks:
        lms = pose_res.pose_landmarks[0]
        ls, rs = lms[11], lms[12]
        lh, rh = lms[23], lms[24]
        nose   = lms[0]

        lean  = abs((ls.x + rs.x) / 2 - (lh.x + rh.x) / 2)
        sdiff = abs(ls.y - rs.y)

        info["posture"] = (
            "leaning"   if lean > 0.12 else
            "slouching" if sdiff > 0.05 else
            "good"
        )

        if   nose.x < 0.4: info["head_position"] = "left"
        elif nose.x > 0.6: info["head_position"] = "right"
        elif nose.y < 0.3: info["head_position"] = "up"
        elif nose.y > 0.7: info["head_position"] = "down"

        info["eye_contact"] = (info["head_position"] == "centered")

    return info


# ─── Main ─────────────────────────────────────────────────────────────────────

def train():
    print("=" * 60)
    print("BODY LANGUAGE DETECTION — TRAINING")
    print("=" * 60)
    print(f"\nVideo dir: {VIDEO_DIR}")

    if not os.path.exists(VIDEO_DIR):
        print(f"ERROR: Video directory not found at:\n  {VIDEO_DIR}")
        sys.exit(1)

    print("\n[1/3] Extracting landmarks from videos...")
    pose_lm, face_lm = make_landmarkers()

    X, y = [], []

    for fname, label in VIDEO_CLASS_MAP.items():
        vpath = os.path.join(VIDEO_DIR, fname)
        if not os.path.exists(vpath):
            print(f"  [SKIP] {fname}")
            continue

        cap         = cv2.VideoCapture(vpath)
        total       = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        step        = max(1, total // 400)
        extracted   = 0
        frame_idx   = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            frame_idx += 1
            if frame_idx % step != 0: continue

            feats = extract_features(frame, pose_lm, face_lm)
            if feats is not None:
                X.append(feats)
                y.append(label)
                extracted += 1
            if extracted >= 400: break

        cap.release()
        print(f"  {label:15s}: {extracted} frames  ({fname})")

    pose_lm.close()
    face_lm.close()

    if len(X) < 50:
        print(f"Not enough data ({len(X)} samples). Check video paths.")
        sys.exit(1)

    X = np.array(X)
    y = np.array(y)

    unique, counts = np.unique(y, return_counts=True)
    print(f"\n  Total: {len(X)} samples | {len(unique)} classes")
    for c, n in zip(unique, counts):
        print(f"    {c}: {n}")

    print("\n[2/3] Training classifier...")
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=500,
            max_depth=25,
            min_samples_split=3,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ))
    ])
    model.fit(X_tr, y_tr)

    y_pred = model.predict(X_te)
    acc    = accuracy_score(y_te, y_pred)
    print(f"\n  Accuracy: {acc:.2%}")
    print(classification_report(y_te, y_pred))

    print("[3/3] Saving...")
    with open(os.path.join(BASE, "body_language_model.pkl"),       "wb") as f: pickle.dump(model, f)
    with open(os.path.join(BASE, "body_language_labels.pkl"),      "wb") as f: pickle.dump(list(unique), f)
    with open(os.path.join(BASE, "body_language_interview_map.pkl"),"wb") as f: pickle.dump(INTERVIEW_INFO, f)
    with open(os.path.join(BASE, "body_language_nfeatures.pkl"),   "wb") as f: pickle.dump(X.shape[1], f)

    print(f"  Saved. Features per sample: {X.shape[1]}")
    print(f"\nTraining complete! Accuracy: {acc:.2%}")


if __name__ == "__main__":
    train()
