import React, { useState } from 'react';
import MedicalForm from '../components/MedicalForm';
import FamilyInterview from '../components/FamilyInterview';
import PredictionResult from '../components/PredictionResult';

function App() {
  const [formData, setFormData] = useState({
    pregnancies: "",
    glucose: "",
    blood_pressure: "",
    skin_thickness: "",
    insulin: "",
    bmi: "",
    age: "",
    diabetes_pedigree_function: 0.5
  });
  const [errors, setErrors] = useState({});

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let numericValue = value === "" ? "" : Number(value);

    if (numericValue < 0) numericValue = 0;

    setFormData({
      ...formData,
      [name]: numericValue
    });
  };

  const validate = () => {
    let newErrors = {};
    const integerFields = ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'age'];

    const maxLimits = {
      blood_pressure: 300,
      glucose: 500,
      skin_thickness: 100,
      insulin: 1000,
      bmi: 100,
      age: 120,
      pregnancies: 20
    };

    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value < 0) {
        newErrors[key] = "Value should not be negative";
      }

      if (maxLimits[key] && value > maxLimits[key]) {
        newErrors[key] = `Value cannot exceed ${maxLimits[key]}`;
      }

      if (integerFields.includes(key) && !Number.isInteger(Number(value))) {
        newErrors[key] = "Value should be integer";
      }

      if (key !== 'pregnancies' && (value === 0 || value === "")) {
        newErrors[key] = "Value should be greater than 0";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }
    setLoading(true);

    const payload = {};
    for (const key in formData) {
      payload[key] = formData[key] === "" ? 0 : Number(formData[key]);
    }

    try {
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Api Error");

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error("Something went wrong", error);
      alert("Connecting with API is impossible, check FastAPI server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-brown text-white flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center py-10 px-6 lg:px-0">

        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-center drop-shadow-md">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-pink">DiaScore</span>
            <span className="text-white ml-3">Prediction</span>
          </h1>
          <p className="text-white/60 mt-4 text-sm uppercase tracking-[0.2em] font-bold">Advanced Diabetes Risk Assessment</p>
        </div>

        {/* FORM CONTAINER */}
        <div className="w-full max-w-7xl bg-brand-red border border-brand-pink rounded-[40px] p-8 lg:p-12 shadow-2xl transition-all duration-1000 overflow-hidden mx-auto">
          <form onSubmit={handleSubmit} noValidate>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* MEDICAL PARAMETERS (LEFT) */}
              <MedicalForm formData={formData} handleChange={handleChange} errors={errors} />

              {/* FAMILY INTERVIEW (RIGHT) */}
              <FamilyInterview />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="mt-12 flex justify-center border-t border-brand-pink/10 pt-8">
              <button
                type="submit"
                disabled={loading}
                className="button-1" role="button">
                {loading ? 'Analyzing...' : 'Send to analyze'}
              </button>
            </div>
          </form>

          {/* PREDICTION RESULT VISUALIZATION */}
          <PredictionResult prediction={prediction} />

        </div>
      </main>
    </div>
  );
}

export default App;
