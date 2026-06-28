import torch
import joblib
import numpy as np
import threading
from pathlib import Path

from .diabetes_model import DiabetesModel

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
WEIGHTS_PATH = PROJECT_ROOT / "ml" / "weights" / "best_model.pt"
SCALER_PATH = PROJECT_ROOT / "ml" / "scaler" / "scaler.joblib"

model_lock = threading.Lock()
scaler_lock = threading.Lock()
CACHED_MODEL = None
CACHED_SCALER = None


def load_model() -> DiabetesModel:
    global CACHED_MODEL

    if CACHED_MODEL is not None:
        return CACHED_MODEL

    with model_lock:
        if CACHED_MODEL is None:
            model = DiabetesModel()
            if not WEIGHTS_PATH.exists():
                raise FileNotFoundError(f"Weights file not found at: {WEIGHTS_PATH}.")

            model.load_state_dict(torch.load(WEIGHTS_PATH, weights_only=True))
            model.eval()
            CACHED_MODEL = model

    return CACHED_MODEL


def _load_scaler():
    global CACHED_SCALER

    if CACHED_SCALER is not None:
        return CACHED_SCALER

    with scaler_lock:
        if CACHED_SCALER is None:
            CACHED_SCALER = joblib.load(SCALER_PATH)

    return CACHED_SCALER


def predict_diabetes_risk(features: list[float], model) -> float:
    if len(features) != 8:
        raise ValueError(
            f"Expected exactly 8 medical features, but got {len(features)}."
        )

    if model is None:
        model = load_model()

    # Scale features using the same scaler used during training
    scaler = _load_scaler()
    features_scaled = scaler.transform(np.array(features).reshape(1, -1))

    patient_tensor = torch.tensor(features_scaled, dtype=torch.float32)

    with torch.no_grad():
        raw_output = model(patient_tensor)
        probability = torch.sigmoid(raw_output).item()

    return probability
