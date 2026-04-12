"""
Speech Emotion Recognition - Model Training
Datasets: RAVDESS (machine learning 1) + CREMA-D (machine learning/AudioWAV)
Emotions: neutral/relaxed, happy, angry/mad, fearful/nervous, sad
"""

import os
import glob
import numpy as np
import librosa
import pickle
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline

# ─── Emotion Mappings ─────────────────────────────────────────────────────────

# RAVDESS: filename = 03-01-EMOTION-intensity-statement-repetition-actor.wav
# Emotion codes: 01=neutral, 02=calm, 03=happy, 04=sad, 05=angry, 06=fearful, 07=disgust, 08=surprised
RAVDESS_MAP = {
    "01": "neutral",
    "02": "neutral",   # calm → neutral/relaxed
    "03": "happy",
    "04": "sad",
    "05": "angry",
    "06": "fearful",
    "07": "angry",     # disgust → angry
    "08": "happy",     # surprised → happy
}

# CREMA-D: filename = actorID_sentence_EMOTION_intensity.wav
CREMAD_MAP = {
    "ANG": "angry",
    "DIS": "angry",    # disgust → angry
    "FEA": "fearful",
    "HAP": "happy",
    "NEU": "neutral",
    "SAD": "sad",
}

# Final label set (maps to interview-friendly names)
INTERVIEW_EMOTION_MAP = {
    "neutral":  "relaxed",
    "happy":    "happy",
    "angry":    "stressed",
    "fearful":  "nervous",
    "sad":      "nervous",  # sad grouped with nervous for interview context
}

# ─── Feature Extraction ───────────────────────────────────────────────────────

def extract_features(file_path: str, sr: int = 22050, duration: float = 3.0) -> np.ndarray | None:
    """Extract MFCC + pitch + energy features from an audio file."""
    try:
        y, sr = librosa.load(file_path, sr=sr, duration=duration, mono=True)

        if len(y) < sr * 0.5:  # Skip files shorter than 0.5s
            return None

        features = []

        # 1. MFCCs (40 coefficients) - mean and std
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        features.extend(np.mean(mfcc, axis=1))
        features.extend(np.std(mfcc, axis=1))

        # 2. Chroma features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        features.extend(np.mean(chroma, axis=1))

        # 3. Mel spectrogram
        mel = librosa.feature.melspectrogram(y=y, sr=sr)
        features.extend(np.mean(mel, axis=1))

        # 4. Spectral contrast
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        features.extend(np.mean(contrast, axis=1))

        # 5. Zero crossing rate
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

    except Exception as e:
        return None


# ─── Load RAVDESS Dataset ─────────────────────────────────────────────────────

def load_ravdess(data_path: str):
    files = glob.glob(os.path.join(data_path, "Actor_*", "*.wav"))
    X, y = [], []

    print(f"  Found {len(files)} RAVDESS files...")
    for i, fp in enumerate(files):
        if i % 200 == 0:
            print(f"    Processing {i}/{len(files)}...")

        fname = os.path.basename(fp)
        parts = fname.replace(".wav", "").split("-")
        if len(parts) < 3:
            continue

        emotion_code = parts[2]
        if emotion_code not in RAVDESS_MAP:
            continue

        raw_emotion = RAVDESS_MAP[emotion_code]
        interview_emotion = INTERVIEW_EMOTION_MAP[raw_emotion]

        feats = extract_features(fp)
        if feats is not None:
            X.append(feats)
            y.append(interview_emotion)

    return X, y


# ─── Load CREMA-D Dataset ─────────────────────────────────────────────────────

def load_cremad(data_path: str):
    files = glob.glob(os.path.join(data_path, "*.wav"))
    X, y = [], []

    print(f"  Found {len(files)} CREMA-D files...")
    for i, fp in enumerate(files):
        if i % 500 == 0:
            print(f"    Processing {i}/{len(files)}...")

        fname = os.path.basename(fp)
        parts = fname.replace(".wav", "").split("_")
        if len(parts) < 3:
            continue

        emotion_code = parts[2].upper()
        if emotion_code not in CREMAD_MAP:
            continue

        raw_emotion = CREMAD_MAP[emotion_code]
        interview_emotion = INTERVIEW_EMOTION_MAP[raw_emotion]

        feats = extract_features(fp)
        if feats is not None:
            X.append(feats)
            y.append(interview_emotion)

    return X, y


# ─── Main Training ────────────────────────────────────────────────────────────

def train():
    BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RAVDESS_PATH = os.path.join(BASE, "..", "machine learning 1")
    CREMAD_PATH  = os.path.join(BASE, "..", "machine learning", "AudioWAV")

    print("=" * 60)
    print("SPEECH EMOTION RECOGNITION - TRAINING")
    print("=" * 60)

    all_X, all_y = [], []

    # Load RAVDESS
    print("\n[1/4] Loading RAVDESS dataset...")
    X1, y1 = load_ravdess(RAVDESS_PATH)
    print(f"  Loaded {len(X1)} RAVDESS samples")
    all_X.extend(X1)
    all_y.extend(y1)

    # Load CREMA-D
    print("\n[2/4] Loading CREMA-D dataset...")
    X2, y2 = load_cremad(CREMAD_PATH)
    print(f"  Loaded {len(X2)} CREMA-D samples")
    all_X.extend(X2)
    all_y.extend(y2)

    print(f"\n  Total samples: {len(all_X)}")

    # Convert to numpy
    X = np.array(all_X)
    y = np.array(all_y)

    # Class distribution
    unique, counts = np.unique(y, return_counts=True)
    print("\n  Class distribution:")
    for cls, cnt in zip(unique, counts):
        print(f"    {cls}: {cnt}")

    # Train/test split
    print("\n[3/4] Training model...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Pipeline: scaler + Random Forest
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=300,
            max_depth=20,
            min_samples_split=4,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ))
    ])

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n  Test Accuracy: {acc:.2%}")
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save model
    print("\n[4/4] Saving model...")
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "emotion_model.pkl")
    labels_path = os.path.join(model_dir, "emotion_labels.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    labels = list(unique)
    with open(labels_path, "wb") as f:
        pickle.dump(labels, f)

    print(f"  Model saved to: {model_path}")
    print(f"  Labels: {labels}")
    print("\nTraining complete!")
    return acc


if __name__ == "__main__":
    train()
