import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))


def train_and_save_scaler(train_csv_path: str, output_dir: str):
    from database.preprocessing import IMPUTE_FEATURE_COLUMNS

    train_csv_path = Path(train_csv_path)
    if not train_csv_path.exists():
        raise FileNotFoundError(f"{train_csv_path} not found. Run split_data.py first.")

    train_df = pd.read_csv(train_csv_path)

    # Fit scaler on training data only - avoids data leakage
    scaler = StandardScaler()
    scaler.fit(train_df[IMPUTE_FEATURE_COLUMNS].astype(float))

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, output_dir / "scaler.joblib")


if __name__ == "__main__":
    train_csv = PROJECT_ROOT / "data" / "train.csv"
    out_dir = Path(__file__).resolve().parent
    train_and_save_scaler(str(train_csv), str(out_dir))
