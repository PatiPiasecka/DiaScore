import pandas as pd
import numpy as np
import joblib

from .preprocessing import IMPUTE_FEATURE_COLUMNS, MISSING_VALUE_COLUMNS, create_imputer


def train_and_save_imputer(train_df: pd.DataFrame, output_path: str):
    df = train_df.copy()

    # Replace zeros with NaN for the columns that signal missingness
    for col in MISSING_VALUE_COLUMNS:
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)

    feature_columns = [c for c in IMPUTE_FEATURE_COLUMNS if c in df.columns]
    data = df[feature_columns].astype(float)

    imputer = create_imputer()
    imputer.fit(data)

    joblib.dump(imputer, output_path)
    print(f"Saved imputer to {output_path}")

    return imputer


if __name__ == "__main__":
    pass
