import React from 'react';
import './MedicalForm.css';

const MedicalForm = ({ formData, handleChange, errors }) => {
  return (
    <div className="medical-form-wrapper">
      <h3 className="medical-form-title">Medical Parameters</h3>

      {[
        { label: 'Pregnancies', name: 'pregnancies', max: 20 },
        { label: 'Glucose (mg/dL)', name: 'glucose', max: 500 },
        { label: 'Blood Pressure (mmHg)', name: 'blood_pressure', max: 300 },
        { label: 'Skin Thickness (mm)', name: 'skin_thickness', max: 100 },
        { label: 'Insulin (µU/mL)', name: 'insulin', max: 1000 },
        { label: 'BMI', name: 'bmi', max: 100 },
        { label: 'Age', name: 'age', max: 120 },
      ].map((field) => (
        <div key={field.name} className="medical-form-field">
          <label className="medical-form-label">
            {field.label}
          </label>

          <div className="group max-w-none!">
            <input
              type="number"
              min="0"
              max={field.max}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder="0"
              className={`input ${errors[field.name] ? 'input-error' : ''}`}
              required
            />
          </div>

          {errors[field.name] && (
            <span className="medical-form-error">
              {errors[field.name]}
            </span>
          )}

        </div>
      ))}
    </div>
  );
};

export default MedicalForm;
