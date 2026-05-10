import React, { useState } from 'react'

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
  })
  const [errors, setErrors] = useState({});

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    let numericValue = value == "" ? "" : Number(value)

    if (numericValue < 0) numericValue=0

    setFormData({
      ...formData,
      [name]: numericValue
    })
  }

  const validate = () => {
    let newErrors = {}
    const integerFields = ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'age']

    const maxLimits = {
      blood_pressure: 300,
      glucose: 500,
      skin_thickness: 100,
      insulin: 1000,
      bmi: 100,
      age: 120,
      glucose: 500,
      pregnancies: 20
    }

    Object.keys(formData).forEach(key => {
      const value = formData[key]

      if (value < 0) {
        newErrors[key] = "Value should not be negative"
      }

      if (maxLimits[key] && value > maxLimits[key]){
        newErrors[key] = `Value cannot exceed ${maxLimits[key]}`
      }

      if (integerFields.includes(key) && !Number.isInteger(Number(value))){
        newErrors[key] = "Value should be integer"
      }

      if (key !== 'pregnancies' && (value===0 || value === "")){
        newErrors[key] = "Value should be greater than 0"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length===0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()){
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Api Error")

      const result = await response.json()
      setPrediction(result)
    } catch (error) {
      console.error("Something went wrong", error)
      alert("Connecting with API is impossible, check FastAPI server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-brown text-white flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center py-10 px-6 lg:px-24">

        <h1 className="text-4xl lg:text-5xl font-black text-brand-orange mb-12 tracking-tight">
          DiaScore Prediction
        </h1>

        {/* FORM  */}
        <div className="w-full bg-brand-red border border-brand-pink rounded-[40px] p-8 lg:p-12 shadow-2xl transition-all duration-500">

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* MEDICAL USER DATA */}
              <div className="space-y-5">
                <h3 className="text-white uppercase text-s font-bold tracking-widest mb-4">Medical Parameters</h3>

                {[
                  { label: 'Pregnancies', name: 'pregnancies', max:20},
                  { label: 'Glucose (mg/dL)', name: 'glucose', max:500},
                  { label: 'Blood Pressure (mmHg)', name: 'blood_pressure', max:300},
                  { label: 'Skin Thickness (mm)', name: 'skin_thickness', max:100},
                  { label: 'Insulin (µU/mL)', name: 'insulin', max:1000},
                  { label: 'BMI', name: 'bmi', max:100},
                  { label: 'Age', name: 'age', max:120},
                ].map((field) => (
                    <div key={field.name} className="flex flex-col mb-4">
                      <label className="text-sm font-medium text-white mb-2 ml-1">
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
                          className={`input ${errors[field.name] ? 'shadow-[0_0_50px_var(--brand-magenta)]' : ''}`}
                          required
                          />
                      </div>

                      {errors[field.name] && (
                        <span className="text-purple-300 text-[14px] mt-1.5 ml-2 font-bold uppercase tracking-tight">
                          {errors[field.name]}
                        </span>
                      )}

                    </div>
                  )
              )}

              </div>

              {/* INFORMATION ABOUT FAMILY*/}
              <div className="space-y-6">
                <h3 className="text-white uppercase text-s font-bold tracking-widest mb-4">Family Interview</h3>
                <div className="bg-brand-brown/40 border border-brand-pink/20 rounded-[30px] p-8 flex flex-col items-center justify-center text-center">
                   <p className="text-white font-medium italic opacity-60">
                     TODO: Family Interview
                   </p>
                </div>
              </div>

            </div>

            {/* BUTTON - SEND */}
            <div className="mt-12 flex justify-center border-t border-brand-pink/10 pt-8">
              <button
                type="submit"
                disabled={loading}
                className="button-1" role="button">
                {loading ? 'Analyzing...' : 'Send to analyze'}
              </button>
            </div>
          </form>

          {/* TODO: Visualization of prediction*/}

        </div>
      </main>
    </div>
  );
}

export default App;
