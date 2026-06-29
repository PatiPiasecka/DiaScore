import React from 'react';
import './MedicalForm.css';

const FORM_FIELDS = [
  { label: 'Pregnancies', name: 'pregnancies', max: 20, required: false },
  { label: 'Glucose (mg/dL)', name: 'glucose', max: 500, required: false },
  { label: 'Blood Pressure (mmHg)', name: 'blood_pressure', max: 300, required: false },
  { label: 'Insulin (µU/mL)', name: 'insulin', max: 1000, required: false },
  { label: 'BMI', name: 'bmi', max: 100, required: false },
  { label: 'Age', name: 'age', max: 120, required: true },
];

const MedicalForm = ({ formData, handleChange, errors, serverError }) => {
  return (
    <div className="medical-form-wrapper">
      <h3 className="medical-form-title">Medical Parameters</h3>
      
      <div className="medical-form-hints">
        <p className="medical-form-hint">
          If your glucose, blood pressure, insulin, or BMI was not measured, you can leave the field blank (or enter 0). We will estimate the missing values for the analysis.
        </p>
        <p className="medical-form-hint">
          If left blank, the pregnancies field is automatically treated as 0 (no pregnancies) and does not affect the reliability of the prediction.
        </p>
        <p className="medical-form-hint">
          The more test results that are missing, the less reliable the prediction may be.
        </p>
      </div>

      {/* Render the server validation error if it exists */}
      {serverError && (
        <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm font-medium">
          {serverError}
        </div>
      )}

      {FORM_FIELDS.map((field) => {
        const placeholder = field.required ? 'Required' : 'Optional';

        return (
          <div key={field.name} className="medical-form-field">
            <label className="medical-form-label">{field.label}</label>

            <div className="group max-w-none!">
              <input
                type="number"
                min="0"
                max={field.max}
                step={field.name === 'bmi' ? 'any' : '1'}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`input ${errors[field.name] ? 'input-error' : ''}`}
                required={field.required}
              />
            </div>

            {errors[field.name] && (
              <span className="medical-form-error">{errors[field.name]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MedicalForm;