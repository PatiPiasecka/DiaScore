import React, { useState } from 'react';
import MedicalForm from '../components/MedicalForm';
import FamilyInterview from '../components/FamilyInterview';
import PredictionResult from '../components/PredictionResult';
import { IMPUTABLE_FIELDS } from '../constants/imputation';

const INTEGER_FIELDS = [
  'pregnancies',
  'glucose',
  'blood_pressure',
  'skin_thickness',
  'insulin',
  'age',
];

const MAX_LIMITS = {
  blood_pressure: 300,
  glucose: 500,
  skin_thickness: 100,
  insulin: 1000,
  bmi: 100,
  age: 120,
  pregnancies: 20,
};

function isMissingMeasurement(value) {
  return value === '' || value === 0;
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function Home() {
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    blood_pressure: '',
    skin_thickness: '',
    insulin: '',
    bmi: '',
    age: '',
    diabetes_pedigree_function: 0.5,
  });
  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, validity } = e.target;

    if (value === '') {
      setFormData({ ...formData, [name]: '' });
      return;
    }

    if (validity.badInput) {
      return;
    }

    let numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    if (numericValue < 0) numericValue = 0;

    setFormData({
      ...formData,
      [name]: numericValue,
    });
  };

  const validate = (formElement) => {
    const newErrors = {};

    if (formElement) {
      formElement.querySelectorAll('input[type="number"]').forEach((input) => {
        if (input.validity.badInput) {
          newErrors[input.name] = 'Enter a valid number';
        }
      });
    }

    Object.keys(formData).forEach((key) => {
      if (key === 'diabetes_pedigree_function') return;

      const value = formData[key];

      if (value !== '' && !isFiniteNumber(value)) {
        newErrors[key] = 'Enter a valid number';
        return;
      }

      if (value !== '' && value < 0) {
        newErrors[key] = 'Value should not be negative';
      }

      if (value !== '' && MAX_LIMITS[key] && value > MAX_LIMITS[key]) {
        newErrors[key] = `Value cannot exceed ${MAX_LIMITS[key]}`;
      }

      if (
        value !== '' &&
        INTEGER_FIELDS.includes(key) &&
        !Number.isInteger(Number(value))
      ) {
        newErrors[key] = 'Value should be integer';
      }

      if (key === 'age' && isMissingMeasurement(value)) {
        newErrors[key] = 'Age is required (must be at least 1)';
      }

      if (
        !IMPUTABLE_FIELDS.includes(key) &&
        key !== 'pregnancies' &&
        key !== 'age' &&
        isMissingMeasurement(value)
      ) {
        newErrors[key] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const payload = {};

    for (const key in formData) {
      if (key === 'diabetes_pedigree_function') {
        payload[key] = Number(formData[key]);
        continue;
      }

      if (formData[key] === '' || !isFiniteNumber(formData[key])) {
        payload[key] = 0;
      } else {
        payload[key] = formData[key];
      }
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate(e.currentTarget)) {
      return;
    }

    setLoading(true);
    setPrediction(null);

    const payload = buildPayload();

    try {
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Api Error');

      setPrediction(await response.json());
    } catch (error) {
      console.error('Something went wrong', error);
      alert('Connecting with API is impossible, check FastAPI server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-brown text-white flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center py-10 px-6 lg:px-0">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-center drop-shadow-md">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-pink">
              DiaScore
            </span>
            <span className="text-white ml-3">Prediction</span>
          </h1>
          <p className="text-white/60 mt-4 text-sm uppercase tracking-[0.2em] font-bold">
            Advanced Diabetes Risk Assessment
          </p>
        </div>

        <div className="w-full max-w-7xl bg-brand-red border border-brand-pink rounded-[40px] p-8 lg:p-12 shadow-2xl transition-all duration-1000 overflow-hidden mx-auto">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <MedicalForm
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FamilyInterview />
            </div>

            <div className="mt-12 flex justify-center border-t border-brand-pink/10 pt-8">
              <button
                type="submit"
                disabled={loading}
                className="button-1"
                role="button"
              >
                {loading ? 'Analyzing...' : 'Send to analyze'}
              </button>
            </div>
          </form>

          <PredictionResult prediction={prediction} />
        </div>
      </main>
    </div>
  );
}

export default Home;
