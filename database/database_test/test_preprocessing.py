import pandas as pd

from database.preprocessing import fill_missing_values
from database.preprocessing import calculate_dpf


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
