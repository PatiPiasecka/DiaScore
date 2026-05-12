import React, { useState } from 'react'
import Gauge from '../components/Gauge'

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

  const [familyMembers, setFamilyMembers] = useState([])
  const [showFamilyForm, setShowFamilyForm] = useState(false)
  const [hasFamilyHistory, setHasFamilyHistory] = useState(null) // yes, no, unknown

  const [currentMember, setCurrentMember] = useState({
    relationship: 'parent',
    earlyOnset: false,
    otherDiseases: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let numericValue = value == "" ? "" : Number(value)

    if (numericValue < 0) numericValue = 0

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
      pregnancies: 20
    }

    Object.keys(formData).forEach(key => {
      const value = formData[key]

      if (value < 0) {
        newErrors[key] = "Value should not be negative"
      }

      if (maxLimits[key] && value > maxLimits[key]) {
        newErrors[key] = `Value cannot exceed ${maxLimits[key]}`
      }

      if (integerFields.includes(key) && !Number.isInteger(Number(value))) {
        newErrors[key] = "Value should be integer"
      }

      if (key !== 'pregnancies' && (value === 0 || value === "")) {
        newErrors[key] = "Value should be greater than 0"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }
    setLoading(true);

    // Convert formData to valid numbers, especially handling empty strings
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

  const addMember = () => {
    if (familyMembers.length >= 15) {
      alert("You can add maximum 15 family members.");
      return;
    }
    if (currentMember.relationship === 'parent') {
      const parentCount = familyMembers.filter(m => m.relationship === 'parent').length;
      if (parentCount >= 2) {
        alert("You can add maximum 2 parents.");
        return;
      }
    }
    if (currentMember.relationship === 'grandparent') {
      const gpCount = familyMembers.filter(m => m.relationship === 'grandparent').length;
      if (gpCount >= 4) {
        alert("You can add maximum 4 grandparents.");
        return;
      }
    }

    setFamilyMembers([...familyMembers, { ...currentMember, id: Date.now() }])
    setCurrentMember({ relationship: 'parent', earlyOnset: false, otherDiseases: [] })
  }

  const removeMember = (id) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id))
  }

  const toggleDisease = (disease) => {
    setCurrentMember(prev => ({
      ...prev,
      otherDiseases: prev.otherDiseases.includes(disease)
        ? prev.otherDiseases.filter(d => d !== disease)
        : [...prev.otherDiseases, disease]
    }))
  }

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

        {/* FORM  */}
        <div className="w-full bg-brand-red border border-brand-pink rounded-[40px] p-8 lg:p-12 shadow-2xl transition-all duration-1000 overflow-hidden">

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* MEDICAL USER DATA */}
              <div className="space-y-5">
                <h3 className="text-white uppercase text-s font-bold tracking-widest mb-4">Medical Parameters</h3>

                {[
                  { label: 'Pregnancies', name: 'pregnancies', max: 20 },
                  { label: 'Glucose (mg/dL)', name: 'glucose', max: 500 },
                  { label: 'Blood Pressure (mmHg)', name: 'blood_pressure', max: 300 },
                  { label: 'Skin Thickness (mm)', name: 'skin_thickness', max: 100 },
                  { label: 'Insulin (µU/mL)', name: 'insulin', max: 1000 },
                  { label: 'BMI', name: 'bmi', max: 100 },
                  { label: 'Age', name: 'age', max: 120 },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col mb-4">
                    <label className="text-xs font-bold text-white/90 tracking-widest uppercase mb-2 ml-1">
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

              <div className="space-y-6">
                <h3 className="text-white uppercase text-s font-bold tracking-widest mb-4">Family Interview</h3>

                <div className="bg-brand-brown/60 backdrop-blur-md border border-brand-pink/30 rounded-[30px] p-8 shadow-inner min-h-[400px] flex flex-col transition-all duration-300">

                  {/* initial question */}
                  {hasFamilyHistory === null && (
                    <div className="flex flex-col items-center justify-center h-full flex-1 space-y-8 text-center py-12 transition-opacity duration-500">
                      <div className="bg-brand-red/40 p-4 rounded-full mb-2 shadow-[0_0_15px_rgba(162,87,79,0.5)]">
                        <svg className="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <h4 className="text-2xl font-bold text-white tracking-wide">Family Medical History</h4>
                      <p className="text-white/80 text-lg max-w-sm leading-relaxed">Does anyone in your close family have or had diabetes?</p>

                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                        <button onClick={() => setHasFamilyHistory('yes')} className="px-8 py-3 bg-gradient-to-r from-brand-orange to-brand-red text-white rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(230,128,87,0.5)] hover:-translate-y-1 transition-all duration-300">Yes</button>
                        <button onClick={() => setHasFamilyHistory('no')} className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">No</button>
                        <button onClick={() => setHasFamilyHistory('unknown')} className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">I don't know</button>
                      </div>
                    </div>
                  )}

                  {/* Add family members */}
                  {hasFamilyHistory === 'yes' && (
                    <div className="flex flex-col h-full transition-opacity duration-500">
                      <div className="flex justify-between items-center border-b border-brand-pink/20 pb-5 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-orange text-brand-brown w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">
                            {familyMembers.length + 1}
                          </div>
                          <h4 className="text-white font-bold text-lg tracking-wide">Add Family Member</h4>
                        </div>
                        <button onClick={() => setHasFamilyHistory(null)} className="text-sm text-brand-pink hover:text-brand-orange hover:underline transition-colors flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                          Back
                        </button>
                      </div>

                      <div className="space-y-8 flex-1">
                        {/* Relationship */}
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Relationship
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {['parent', 'sibling', 'grandparent', 'other'].map(rel => (
                              <button
                                key={rel}
                                type="button"
                                onClick={() => setCurrentMember({ ...currentMember, relationship: rel })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all duration-300 border ${currentMember.relationship === rel ? 'bg-brand-pink/90 border-brand-pink text-white shadow-lg shadow-brand-pink/20 scale-[1.02]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30'}`}
                              >
                                {rel}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Diagnosis age */}
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Diagnosis before age 50?
                          </label>
                          <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${currentMember.earlyOnset ? 'bg-brand-orange/20 border-brand-orange text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                              <input type="radio" name="onset" checked={currentMember.earlyOnset} onChange={() => setCurrentMember({ ...currentMember, earlyOnset: true })} className="hidden" />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${currentMember.earlyOnset ? 'border-brand-orange' : 'border-white/40'}`}>
                                {currentMember.earlyOnset && <div className="w-2 h-2 bg-brand-orange rounded-full"></div>}
                              </div>
                              <span className="font-medium">Yes</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${!currentMember.earlyOnset ? 'bg-brand-orange/20 border-brand-orange text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                              <input type="radio" name="onset" checked={!currentMember.earlyOnset} onChange={() => setCurrentMember({ ...currentMember, earlyOnset: false })} className="hidden" />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!currentMember.earlyOnset ? 'border-brand-orange' : 'border-white/40'}`}>
                                {!currentMember.earlyOnset && <div className="w-2 h-2 bg-brand-orange rounded-full"></div>}
                              </div>
                              <span className="font-medium">No</span>
                            </label>
                          </div>
                        </div>

                        {/* Other diseases */}
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            Other conditions
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {['Obesity', 'Hypertension', 'Heart Disease'].map(disease => (
                              <button
                                key={disease}
                                type="button"
                                onClick={() => toggleDisease(disease)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${currentMember.otherDiseases.includes(disease) ? 'bg-brand-orange text-white border-brand-orange shadow-[0_0_10px_rgba(230,128,87,0.4)]' : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white'}`}
                              >
                                {disease}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          type="button"
                          onClick={addMember}
                          className="w-full py-4 bg-brand-pink/10 border-2 border-brand-pink border-dashed text-brand-pink rounded-2xl font-bold hover:bg-brand-pink hover:text-white hover:border-solid hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                          Save Family Member
                        </button>
                      </div>

                      {/* Family members list */}
                      {familyMembers.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-brand-pink/20">
                          <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">Added Members ({familyMembers.length})</p>
                          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {familyMembers.map(member => (
                              <div key={member.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-brand-orange/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/10 w-full">
                                <div className="flex items-center gap-3">
                                  <div className="bg-brand-brown w-10 h-10 rounded-full flex items-center justify-center border border-white/10">
                                    <svg className="w-5 h-5 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                  </div>
                                  <div>
                                    <span className="block font-bold capitalize text-white">{member.relationship}</span>
                                    <span className="block text-xs text-white/60">
                                      {member.earlyOnset ? 'Early onset' : 'Late onset'}
                                      {member.otherDiseases.length > 0 && ` • ${member.otherDiseases.length} condition(s)`}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => removeMember(member.id)} className="text-brand-orange/70 hover:text-brand-orange hover:bg-brand-orange/10 p-2 rounded-full transition-all" title="Remove member">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View for 'no' and 'unknown' choice */}
                  {(hasFamilyHistory === 'no' || hasFamilyHistory === 'unknown') && (
                    <div className="flex flex-col items-center justify-center h-full flex-1 text-center p-8 space-y-6 transition-opacity duration-500">
                      <div className="bg-white/5 p-6 rounded-full border border-white/10 shadow-inner">
                        <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">History Recorded</h4>
                        <p className="text-white/60 leading-relaxed max-w-sm">No specific family history will be added. The algorithm will use a baseline score for genetic factors.</p>
                      </div>
                      <button onClick={() => setHasFamilyHistory(null)} className="px-6 py-2 rounded-full border border-brand-orange/50 text-brand-orange font-medium hover:bg-brand-orange hover:text-white transition-all duration-300 mt-4 hover:shadow-[0_0_15px_rgba(230,128,87,0.3)]">
                        Change Answer
                      </button>
                    </div>
                  )}

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

          {/* Visualization of prediction */}
          {prediction && (
            <div className="w-full mt-10 border-t border-brand-pink/20 pt-10 transition-all duration-1000 animate-fade-in">
              <div className="w-full bg-brand-brown rounded-[30px] p-8 lg:p-10 shadow-inner grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                {/* LEFT SIDE: GAUGE */}
                <div className="flex flex-col items-center border-b lg:border-b-0 lg:border-r border-brand-pink/10 pb-10 lg:pb-0 lg:pr-10">
                  <h2 className="text-3xl font-black text-center text-white tracking-tight mb-2">Prediction Result</h2>
                  <Gauge percentage={Math.round(prediction.risk_score * 100)} />
                </div>

                {/* RIGHT SIDE: RECOMMENDATIONS */}
                <div className="flex flex-col space-y-6 pl-0 lg:pl-4">
                  <div>
                    <h3 className="text-sm font-bold text-brand-orange tracking-widest uppercase mb-2">Next Steps</h3>
                    <h4 className="text-2xl font-bold text-white">Recommendations</h4>
                  </div>

                  <div className="space-y-4">
                    {prediction.risk_score * 100 > 66 ? (
                      <>
                        <div className="bg-white/5 p-4 rounded-xl border border-brand-pink/20 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-brand-pink font-bold">1</span>
                          </div>
                          <div>
                            <p className="text-white font-bold mb-1">Consult a Healthcare Provider</p>
                            <p className="text-white/60 text-sm">Please schedule an appointment with your doctor to discuss these results and get a professional diagnosis.</p>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-brand-pink/20 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-brand-pink font-bold">2</span>
                          </div>
                          <div>
                            <p className="text-white font-bold mb-1">Schedule Blood Tests</p>
                            <p className="text-white/60 text-sm">Comprehensive metabolic panel and HbA1c tests are highly recommended to verify your glucose levels.</p>
                          </div>
                        </div>
                      </>
                    ) : prediction.risk_score * 100 > 33 ? (
                      <>
                        <div className="bg-white/5 p-4 rounded-xl border border-yellow-400/20 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-yellow-400 font-bold">1</span>
                          </div>
                          <div>
                            <p className="text-white font-bold mb-1">Monitor Your Diet</p>
                            <p className="text-white/60 text-sm">Focus on a balanced diet with lower sugar and carbohydrate intake. Consider tracking your meals.</p>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-yellow-400/20 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-yellow-400 font-bold">2</span>
                          </div>
                          <div>
                            <p className="text-white font-bold mb-1">Increase Physical Activity</p>
                            <p className="text-white/60 text-sm">Aim for at least 150 minutes of moderate aerobic activity every week to improve insulin sensitivity.</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/5 p-4 rounded-xl border border-green-400/20 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-green-400 font-bold">✓</span>
                          </div>
                          <div>
                            <p className="text-white font-bold mb-1">Maintain Healthy Lifestyle</p>
                            <p className="text-white/60 text-sm">Your risk is low. Continue your current habits regarding diet and exercise to stay healthy.</p>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-green-400/20 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-green-400 font-bold">✓</span>
                          </div>
                          <div>
                            <p className="text-white font-bold mb-1">Routine Check-ups</p>
                            <p className="text-white/60 text-sm">Keep up with your standard annual medical exams to monitor your baseline health metrics.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* MEDICAL DISCLAIMER */}
              <p className="mt-6 text-center text-[11px] leading-relaxed text-white/40 max-w-3xl mx-auto">
                <strong className="text-white/60">Disclaimer:</strong> The DiaScore prediction is generated by a machine learning algorithm for informational purposes only and does not constitute a professional medical diagnosis. We assume no liability or responsibility for any decisions made based on these results. Always consult with a qualified healthcare provider regarding your health and medical conditions.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
