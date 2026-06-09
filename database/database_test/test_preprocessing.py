import pandas as pd
from sklearn.impute import KNNImputer
from database.preprocessing import fill_missing_values, calculate_dpf, impute_record


def test_dpf_calculation_no_history():
    """No family history should return the normalized minimum (0.078)."""
    result = calculate_dpf([], "no")
    assert result == 0.078


def test_dpf_calculation_unknown_history():
    """An 'unknown' response should also return the normalized minimum."""
    result = calculate_dpf([], "unknown")
    assert result == 0.078


def test_dpf_calculation_extreme_history():
    """Maximum genetic load (e.g., 15 first-degree relatives with early onset) should return 2.420."""
    extreme_family = [{"relationship": "parent", "earlyOnset": True} for _ in range(15)]
    result = calculate_dpf(extreme_family, "yes")
    assert result == 2.420


def test_dpf_calculation_medium_history():
    """Check if a single relative correctly scales the result between the min and max boundaries."""
    light_family = [{"relationship": "grandparent", "earlyOnset": False}]
    result = calculate_dpf(light_family, "yes")

    assert 0.078 < result < 2.420


def test_fill_missing_values_imputes_zeros_with_knn():
    """Test the pandas-based dataframe imputation logic used for training data."""
    df = pd.DataFrame(
        {
            "Glucose": [0, 120, 130],
            "BloodPressure": [70, 0, 80],
            "SkinThickness": [0, 30, 40],
            "Insulin": [0, 85, 90],
            "BMI": [0.0, 28.0, 32.0],
            "Pregnancies": [2, 3, 1],
        }
    )

    cleaned = fill_missing_values(df)

    assert cleaned.loc[0, "Glucose"] == 125
    assert cleaned.loc[1, "BloodPressure"] == 75
    assert cleaned.loc[0, "SkinThickness"] == 35
    assert cleaned.loc[0, "Insulin"] == 87.5
    assert cleaned.loc[0, "BMI"] == 30.0
    assert cleaned.loc[0, "Pregnancies"] == 2
    assert (cleaned["Glucose"] != 0).all()
    assert not cleaned["Glucose"].isna().any()


def test_impute_record_tracks_missing_fields():
    """Test that the dictionary-based single-record imputer tracks replaced zero values."""
    # Create a dummy fitted imputer using a DataFrame to prevent scikit-learn warnings
    imputer = KNNImputer(n_neighbors=1)

    dummy_data = pd.DataFrame(
        [[1, 100, 70, 20, 50, 25.0, 0.5, 30]],
        columns=[
            "Pregnancies",
            "Glucose",
            "BloodPressure",
            "SkinThickness",
            "Insulin",
            "BMI",
            "DiabetesPedigreeFunction",
            "Age",
        ],
    )
    imputer.fit(dummy_data)

    # Provide a record with intentional missing values (0)
    record = {
        "pregnancies": 1,
        "glucose": 0,  # Should be tracked
        "blood_pressure": 70,
        "skin_thickness": 0,  # Should be tracked
        "insulin": 50,
        "bmi": 25.0,
        "has_family_history": "unknown",
        "family_members": [],
        "age": 30,
    }

    result = impute_record(record, imputer)

    assert "imputed_fields" in result
    assert "glucose" in result["imputed_fields"]
    assert "skin_thickness" in result["imputed_fields"]

    # Fields that had valid data should not be in the tracked list
    assert "blood_pressure" not in result["imputed_fields"]
    assert "insulin" not in result["imputed_fields"]
