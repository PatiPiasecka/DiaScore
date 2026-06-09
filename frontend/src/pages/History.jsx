import React from 'react';
import { useHistory } from '../hooks/useHistory';

const History = () => {
  const { predictions, loading, error } = useHistory();

  /**
   * Helper function to check if a specific field was imputed by the KNN model.
   * Renders "N/A" if imputed, otherwise displays the original user-provided value.
   */
  const renderDataCell = (record, fieldKey, value) => {
    if (record.imputed_fields?.includes(fieldKey)) {
      return (
        <span className="text-white/40 italic font-semibold" title="Imputed value">
          N/A
        </span>
      );
    }
    return value;
  };

  return (
    <div className="w-full text-white flex flex-col font-sans items-center py-10 px-6 lg:px-12">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-center drop-shadow-md">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lilac to-[#dca3d6]">
            DiaScore
          </span>
          <span className="text-white ml-3">History</span>
        </h1>
        <p className="text-white/60 mt-4 text-sm uppercase tracking-[0.2em] font-bold">
          Your analysis history
        </p>
      </div>

      <div className="w-full max-w-[1200px] bg-brand-surface border border-brand-mauve rounded-[40px] p-8 shadow-2xl overflow-hidden mx-auto">
        {/* Loading state rendering */}
        {loading && (
          <p className="text-center text-white/60 font-medium py-8 animate-pulse">
            Loading history...
          </p>
        )}
        
        {/* Error state rendering */}
        {error && (
          <p className="text-center text-red-400 py-8">
            Error: {error}
          </p>
        )}

        {/* Empty state rendering */}
        {!loading && !error && predictions.length === 0 && (
          <p className="text-center text-white/60 py-8">
            No history saved. Make your first prediction!
          </p>
        )}

        {/* Populated table rendering */}
        {!loading && !error && predictions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-brand-mauve/30 text-white/80 uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Age</th>
                  <th className="p-4 font-semibold" title="Pregnancies">Preg.</th>
                  <th className="p-4 font-semibold">Glucose</th>
                  <th className="p-4 font-semibold" title="Blood Pressure">BP</th>
                  <th className="p-4 font-semibold" title="Skin Thickness">Skin</th>
                  <th className="p-4 font-semibold">Insulin</th>
                  <th className="p-4 font-semibold">BMI</th>
                  <th className="p-4 font-semibold text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b border-brand-mauve/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-white/80 whitespace-nowrap">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="p-4 text-white/80">{record.age}</td>
                    
                    {/* Pregnancies are not part of the imputation model */}
                    <td className="p-4 text-white/80">{record.pregnancies}</td>
                    
                    <td className="p-4 text-white/80">
                      {renderDataCell(record, 'glucose', record.glucose)}
                    </td>

                    <td className="p-4 text-white/80">
                      {renderDataCell(record, 'blood_pressure', record.blood_pressure)}
                    </td>

                    <td className="p-4 text-white/80">
                      {renderDataCell(record, 'skin_thickness', record.skin_thickness)}
                    </td>

                    <td className="p-4 text-white/80">
                      {renderDataCell(record, 'insulin', record.insulin)}
                    </td>
                    
                    <td className="p-4 text-white/80">
                      {renderDataCell(record, 'bmi', record.bmi?.toFixed(1))}
                    </td>
                    
                    <td className="p-4 font-bold text-right">
                      <span className={record.risk_score > 0.5 ? 'text-[#ff7b7b]' : 'text-[#84ff9f]'}>
                        {(record.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;