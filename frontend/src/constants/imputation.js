/**
 * Fields where the backend treats 0 or empty as a missing measurement
 * and applies KNN imputation (see database/preprocessing.py).
 */
export const IMPUTABLE_FIELDS = [
  'glucose',
  'blood_pressure',
  'skin_thickness',
  'insulin',
  'bmi',
];
