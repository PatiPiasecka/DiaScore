import pandas as pd
from database.preprocessing import fill_missing_values


def test_predict_endpoint_applies_imputation(client):
    """Test that /predict/ applies KNN imputation to zero-valued fields."""
    new_data = {
        "pregnancies": 1,
        "glucose": 0,
        "blood_pressure": 0,
        "skin_thickness": 0,
        "insulin": 0,
        "bmi": 0.0,
        "diabetes_pedigree_function": 0.5,
        "age": 45,
        "user_id": "test_123",
    }

    post_response = client.post("/predict/", json=new_data)
    assert post_response.status_code == 201
    created = post_response.json()

    # Imputer should have replaced zeros in these fields - check directly in response
    assert created["glucose"] != 0, "glucose should be imputed (not 0)"
    assert created["blood_pressure"] != 0, "blood_pressure should be imputed (not 0)"
    assert created["skin_thickness"] != 0, "skin_thickness should be imputed (not 0)"
    assert created["insulin"] != 0, "insulin should be imputed (not 0)"
    assert created["bmi"] != 0.0, "bmi should be imputed (not 0.0)"

    assert "diabetes_pedigree_function" in created
    assert created["diabetes_pedigree_function"] > 0, (
        "DPF should be automatically calculated"
    )


def test_fill_missing_values_imputes_zeros_with_knn():
    """Test the pandas-based dataframe imputation logic."""
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
    assert cleaned.loc[0, "Pregnancies"] == 2