from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.impute import KNNImputer

MISSING_VALUE_COLUMNS = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
]

IMPUTE_FEATURE_COLUMNS = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]


def calculate_dpf(family_members: list, has_family_history: str) -> float:
    TARGET_MIN = 0.078
    TARGET_MAX = 2.420
    HEURISTIC_MIN = 0.400
    HEURISTIC_MAX = 7.600

    if has_family_history != "yes" or not family_members:
        raw_dpf = HEURISTIC_MIN
    else:
        numerator_sum = 0
        for member in family_members:
            rel = member.get("relationship", "other")
            early_onset = member.get("earlyOnset", False)

            if rel in ["parent", "sibling"]:
                k = 0.500
            elif rel == "grandparent":
                k = 0.250
            else:
                k = 0.125

            adm = 40 if early_onset else 60
            numerator_sum += k * (88 - adm)

        raw_dpf = (numerator_sum + 20) / 50

    raw_dpf = min(raw_dpf, HEURISTIC_MAX)
    normalized_dpf = ((raw_dpf - HEURISTIC_MIN) / (HEURISTIC_MAX - HEURISTIC_MIN)) * (
        TARGET_MAX - TARGET_MIN
    ) + TARGET_MIN

    return round(normalized_dpf, 3)


def create_imputer() -> KNNImputer:
    return KNNImputer(n_neighbors=5, weights="uniform")


def load_imputer(imputer_path: str | Path):
    return joblib.load(Path(imputer_path))


def fill_missing_values(df: pd.DataFrame, imputer=None) -> pd.DataFrame:
    """Fill missing values in the diabetes dataset using KNN imputation.

    In this dataset, zeros in the selected columns represent missing
    measurements rather than actual values. We replace those zeros with
    NaN and let KNNImputer estimate them from similar patient records.

    If a fitted imputer is provided, it will be used to transform the data.
    Otherwise a new imputer is fitted on the provided dataset.
    """
    cleaned_df = df.copy()

    for column in MISSING_VALUE_COLUMNS:
        if column in cleaned_df.columns:
            cleaned_df[column] = cleaned_df[column].replace(0, np.nan)

    feature_columns = [
        col for col in IMPUTE_FEATURE_COLUMNS if col in cleaned_df.columns
    ]
    if feature_columns:
        cleaned_df[feature_columns] = cleaned_df[feature_columns].astype(float)
        if imputer is None:
            imputer = create_imputer()
            cleaned_df[feature_columns] = imputer.fit_transform(
                cleaned_df[feature_columns]
            )
        else:
            cleaned_df[feature_columns] = imputer.transform(cleaned_df[feature_columns])

    return cleaned_df


def impute_record(record: dict, imputer) -> dict:
    """Impute missing fields in a single input record using a fitted imputer.

    - `record` is a dict with snake_case keys (from API/Pydantic).
    - `imputer` is a fitted sklearn `KNNImputer` instance.

    Only columns listed in MISSING_VALUE_COLUMNS will be replaced when
    they were provided as 0 (treated as missing). Other fields are left as-is.
    """

    # Calculate pedigree function
    has_history = record.get("has_family_history", "unknown")
    family_members = record.get("family_members", [])
    record["diabetes_pedigree_function"] = calculate_dpf(family_members, has_history)

    if imputer is None:
        record["imputed_fields"] = []
        return record

    # Map snake_case keys (from API) to PascalCase keys (from CSV dataset)
    case_map = {
        "pregnancies": "Pregnancies",
        "glucose": "Glucose",
        "blood_pressure": "BloodPressure",
        "skin_thickness": "SkinThickness",
        "insulin": "Insulin",
        "bmi": "BMI",
        "diabetes_pedigree_function": "DiabetesPedigreeFunction",
        "age": "Age",
    }

    # Convert record to dataset column names
    data_cols = {case_map[k]: record[k] for k in record if k in case_map}

    feature_cols = [c for c in IMPUTE_FEATURE_COLUMNS if c in data_cols]
    if not feature_cols:
        record["imputed_fields"] = []
        return record

    row = {c: data_cols.get(c, None) for c in feature_cols}
    imputed_fields = []

    # Replace zeros with NaN only for columns that represent missing markers
    for col in MISSING_VALUE_COLUMNS:
        if col in row and (row[col] == 0 or row[col] is None):
            row[col] = np.nan
            # Find the original snake_case key
            api_key = next((k for k, v in case_map.items() if v == col), col.lower())
            imputed_fields.append(api_key)

    record["imputed_fields"] = imputed_fields

    df = pd.DataFrame([row], columns=feature_cols)
    df = df.astype(float)

    imputed = imputer.transform(df)

    # Update only the missing columns in the original record (convert back to snake_case)
    reverse_map = {v: k for k, v in case_map.items()}
    for idx, col in enumerate(feature_cols):
        if col in MISSING_VALUE_COLUMNS:
            val = imputed[0, idx]
            api_key = reverse_map[col]
            if col in ("Glucose", "BloodPressure", "SkinThickness", "Insulin"):
                record[api_key] = int(round(float(val)))
            else:
                record[api_key] = float(val)

    return record
