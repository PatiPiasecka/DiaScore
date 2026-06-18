import sys
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))


RANDOM_SEED = 1789


def split_data(csv_path: str, output_dir: str) -> None:
    from database.preprocessing import fill_missing_values
    from database.train_imputer import train_and_save_imputer

    df = pd.read_csv(csv_path)

    # Split: 70% train, 15% val, 15% test
    # stratify by Outcome - preserve class balance in each set (ml/notebooks/01_data_exploration.ipynb)
    train_df, temp_df = train_test_split(
        df, test_size=0.30, random_state=RANDOM_SEED, stratify=df["Outcome"]
    )
    val_df, test_df = train_test_split(
        temp_df, test_size=0.50, random_state=RANDOM_SEED, stratify=temp_df["Outcome"]
    )

    imputer_path = PROJECT_ROOT / "database" / "imputer.joblib"
    imputer = train_and_save_imputer(train_df, str(imputer_path))

    train_df = fill_missing_values(train_df, imputer)
    val_df = fill_missing_values(val_df, imputer)
    test_df = fill_missing_values(test_df, imputer)

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    train_df.to_csv(output_dir / "train.csv", index=False)
    val_df.to_csv(output_dir / "val.csv", index=False)
    test_df.to_csv(output_dir / "test.csv", index=False)


if __name__ == "__main__":
    csv_path = PROJECT_ROOT / "data" / "diabetes.csv"
    out_dir = PROJECT_ROOT / "data"
    split_data(str(csv_path), str(out_dir))
