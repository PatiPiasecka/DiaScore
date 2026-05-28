import pandas as pd

from database.preprocessing import fill_missing_values


def test_fill_missing_values_imputes_zeros_with_knn():
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
