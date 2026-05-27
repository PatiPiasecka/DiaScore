import React, { useState } from 'react';
import './FamilyInterview.css';

const FamilyInterview = ({ 
  familyMembers, 
  setFamilyMembers, 
  hasFamilyHistory, 
  setHasFamilyHistory 
}) 
=> {

  const [currentMember, setCurrentMember] = useState({
    relationship: 'parent',
    earlyOnset: false,
    otherDiseases: []
  });

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

    setFamilyMembers([...familyMembers, { ...currentMember, id: Date.now() }]);
    setCurrentMember({ relationship: 'parent', earlyOnset: false, otherDiseases: [] });
  };

  const removeMember = (id) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const toggleDisease = (disease) => {
    setCurrentMember(prev => ({
      ...prev,
      otherDiseases: prev.otherDiseases.includes(disease)
        ? prev.otherDiseases.filter(d => d !== disease)
        : [...prev.otherDiseases, disease]
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="fi-title">Family Interview</h3>

      <div className="fi-container">
        {/* initial question */}
        {hasFamilyHistory === null && (
          <div className="fi-initial-view">
            <div className="fi-icon-wrapper">
              <svg className="w-10 h-10 text-brand-lilac" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h4 className="fi-heading">Family Medical History</h4>
            <p className="fi-description">Does anyone in your close family have or had diabetes?</p>

            <div className="fi-button-group">
              <button onClick={() => setHasFamilyHistory('yes')} className="fi-btn-yes">Yes</button>
              <button onClick={() => setHasFamilyHistory('no')} className="fi-btn-no">No</button>
              <button onClick={() => setHasFamilyHistory('unknown')} className="fi-btn-no">I don't know</button>
            </div>
          </div>
        )}

        {/* Add family members */}
        {hasFamilyHistory === 'yes' && (
          <div className="fi-add-view">
            <div className="fi-header">
              <div className="flex items-center gap-3">
                <div className="fi-counter">
                  {familyMembers.length + 1}
                </div>
                <h4 className="text-white font-bold text-lg tracking-wide">Add Family Member</h4>
              </div>
              <button onClick={() => setHasFamilyHistory(null)} className="fi-back-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back
              </button>
            </div>

            <div className="space-y-8 flex-1">
              {/* Relationship */}
              <div className="space-y-4">
                <label className="fi-label">
                  <svg className="w-4 h-4 text-brand-lilac" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Relationship
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['parent', 'sibling', 'grandparent', 'other'].map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setCurrentMember({ ...currentMember, relationship: rel })}
                      className={`fi-pill-btn ${currentMember.relationship === rel ? 'fi-pill-btn-active' : 'fi-pill-btn-inactive'}`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnosis age */}
              <div className="space-y-4">
                <label className="fi-label">
                  <svg className="w-4 h-4 text-brand-lilac" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Diagnosis before age 50?
                </label>
                <div className="flex gap-4">
                  <label className={`fi-radio-box ${currentMember.earlyOnset ? 'fi-radio-box-active' : 'fi-radio-box-inactive'}`}>
                    <input type="radio" name="onset" checked={currentMember.earlyOnset} onChange={() => setCurrentMember({ ...currentMember, earlyOnset: true })} className="hidden" />
                    <div className={`fi-radio-circle ${currentMember.earlyOnset ? 'border-brand-lilac' : 'border-white/40'}`}>
                      {currentMember.earlyOnset && <div className="fi-radio-dot"></div>}
                    </div>
                    <span className="font-medium">Yes</span>
                  </label>
                  <label className={`fi-radio-box ${!currentMember.earlyOnset ? 'fi-radio-box-active' : 'fi-radio-box-inactive'}`}>
                    <input type="radio" name="onset" checked={!currentMember.earlyOnset} onChange={() => setCurrentMember({ ...currentMember, earlyOnset: false })} className="hidden" />
                    <div className={`fi-radio-circle ${!currentMember.earlyOnset ? 'border-brand-lilac' : 'border-white/40'}`}>
                      {!currentMember.earlyOnset && <div className="fi-radio-dot"></div>}
                    </div>
                    <span className="font-medium">No</span>
                  </label>
                </div>
              </div>

              {/* Other diseases */}
              <div className="space-y-4">
                <label className="fi-label">
                  <svg className="w-4 h-4 text-brand-lilac" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  Other conditions
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Obesity', 'Hypertension', 'Heart Disease'].map(disease => (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => toggleDisease(disease)}
                      className={`fi-chip-btn ${currentMember.otherDiseases.includes(disease) ? 'fi-chip-btn-active' : 'fi-chip-btn-inactive'}`}
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
                className="fi-save-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Save Family Member
              </button>
            </div>

            {/* Family members list */}
            {familyMembers.length > 0 && (
              <div className="fi-list-container">
                <p className="fi-list-title">Added Members ({familyMembers.length})</p>
                <div className="fi-list custom-scrollbar">
                  {familyMembers.map(member => (
                    <div key={member.id} className="fi-list-item">
                      <div className="flex items-center gap-3">
                        <div className="fi-list-icon">
                          <svg className="w-5 h-5 text-brand-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                          <span className="block font-bold capitalize text-white">{member.relationship}</span>
                          <span className="block text-xs text-white/60">
                            {member.earlyOnset ? 'Early onset' : 'Late onset'}
                            {member.otherDiseases.length > 0 && ` • ${member.otherDiseases.length} condition(s)`}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeMember(member.id)} className="fi-delete-btn" title="Remove member">
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
          <div className="fi-no-history-view">
            <div className="fi-no-history-icon">
              <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">History Recorded</h4>
              <p className="text-white/60 leading-relaxed max-w-sm">No specific family history will be added. The algorithm will use a baseline score for genetic factors.</p>
            </div>
            <button onClick={() => setHasFamilyHistory(null)} className="fi-change-btn">
              Change Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyInterview;
