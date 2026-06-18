import sys
import torch
from torch.utils.data import Dataset

from pathlib import Path
import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

SCALER_PATH = PROJECT_ROOT / "ml" / "scaler" / "scaler.joblib"


class DiabetesDataset(Dataset):
    """Loads a pre-split CSV (already imputed) and scales features."""

    def __init__(self, data_path: str) -> None:
        self.data_path = data_path
        self.preprocessing_data()

    def __len__(self) -> int:
        return len(self.features)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        return self.features[idx], self.labels[idx]

    def preprocessing_data(self) -> None:
        self.df = pd.read_csv(self.data_path)

        # Scale features (scaler fitted on train only)
        scaler = joblib.load(SCALER_PATH)
        feature_columns = self.df.drop(columns="Outcome").columns
        self.df[feature_columns] = scaler.transform(self.df[feature_columns])

        # Convert to tensors
        self.features = torch.tensor(
            self.df.drop(columns="Outcome").values, dtype=torch.float32
        )

        self.labels = torch.tensor(
            self.df["Outcome"].values, dtype=torch.float32
        ).unsqueeze(1)
