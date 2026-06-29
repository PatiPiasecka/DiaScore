import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MedicalForm from '../components/MedicalForm';
import FamilyInterview from '../components/FamilyInterview';
import PredictionResult from '../components/PredictionResult';
import { IMPUTABLE_FIELDS } from '../constants/imputation';
import { getOrCreateUserId } from '../utils/user';

const INTEGER_FIELDS = [
  'pregnancies',
  'glucose',
  'blood_pressure',
  'insulin',
  'age',
];

const MAX_LIMITS = {
  blood_pressure: 300,
  glucose: 500,
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
    insulin: '',
    bmi: '',
    age: '',
  });

  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const [familyMembers, setFamilyMembers] = useState([]);
  const [hasFamilyHistory, setHasFamilyHistory] = useState(null);

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
      if (formData[key] === '' || !isFiniteNumber(formData[key])) {
        payload[key] = 0;
      } else {
        payload[key] = formData[key];
      }
    }

    payload.skin_thickness = 0;
    payload.has_family_history = hasFamilyHistory || "unknown";
    payload.family_members = familyMembers;
    payload.user_id = getOrCreateUserId();

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
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error('VITE_API_URL is not defined');

      const response = await fetch(`${apiUrl}/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      let responseData;
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const msg = responseData?.detail || responseData || 'Unexpected error occurred';
        // Format: <status> <statusText>: <message>
        toast.error(`${response.status} ${response.statusText}: ${msg}`);
        return;
      }

      setPrediction(responseData);
    } catch (error) {
      console.error('System error:', error);
      toast.error('Service is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-white flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center py-10 w-full px-6 lg:px-12">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-center drop-shadow-md">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lilac to-[#dca3d6]">
              DiaScore
            </span>
            <span className="text-white ml-3">Prediction</span>
          </h1>
          <p className="text-white/60 mt-4 text-sm uppercase tracking-[0.2em] font-bold">
            Advanced Diabetes Risk Assessment
          </p>
        </div>

        <div className="w-full max-w-[1500px] bg-brand-surface border border-brand-mauve rounded-[40px] p-8 lg:p-12 shadow-2xl transition-all duration-1000 overflow-hidden mx-auto">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col items-center">
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
              <div className="lg:col-span-5">
                <MedicalForm
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
              </div>
              <div className="lg:col-span-7">
                <FamilyInterview
                  familyMembers={familyMembers}
                  setFamilyMembers={setFamilyMembers}
                  hasFamilyHistory={hasFamilyHistory}
                  setHasFamilyHistory={setHasFamilyHistory}
                />
              </div>
            </div>

            <div className="w-full max-w-7xl mt-12 flex justify-center border-t border-brand-mauve/10 pt-8">
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