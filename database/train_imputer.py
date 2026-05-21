from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
import joblib

from database.preprocessing import IMPUTE_FEATURE_COLUMNS, MISSING_VALUE_COLUMNS


def train_and_save_imputer(csv_path: str, output_path: str):
    df = pd.read_csv(csv_path)

    # Replace zeros with NaN for the columns that signal missingness
    for col in MISSING_VALUE_COLUMNS:
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)

    feature_columns = [c for c in IMPUTE_FEATURE_COLUMNS if c in df.columns]
    data = df[feature_columns].astype(float)

    imputer = KNNImputer(n_neighbors=5, weights="uniform")
    imputer.fit(data)

    joblib.dump(imputer, output_path)
    print(f"Saved imputer to {output_path}")


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent
    csv_path = BASE_DIR.parent / "data" / "diabetes.csv"
    out = BASE_DIR / "imputer.joblib"
    train_and_save_imputer(csv_path, out)
