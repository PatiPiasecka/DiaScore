import React from 'react';
import { useHistory } from '../hooks/useHistory';
// Import the separated CSV export utility
import { downloadHistoryCSV } from '../utils/csvExport';

const History = () => {
  const { predictions, loading, error } = useHistory();

  /**
   * Helper function to check if a specific field was imputed by the KNN model.
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
        
        {/* Top actions bar containing the Export button */}
        {!loading && !error && predictions.length > 0 && (
          <div className="w-full flex justify-end mb-6">
            <button
              // Call the utility function and pass the data
              onClick={() => downloadHistoryCSV(predictions)}
              className="px-5 py-2.5 bg-transparent border border-brand-lilac text-brand-lilac hover:bg-brand-lilac hover:text-black font-bold rounded-2xl text-sm transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center text-white/60 font-medium py-8 animate-pulse">
            Loading history...
          </p>
        )}
        
        {error && (
          <p className="text-center text-red-400 py-8">
            Error: {error}
          </p>
        )}

        {!loading && !error && predictions.length === 0 && (
          <p className="text-center text-white/60 py-8">
            No history saved. Make your first prediction!
          </p>
        )}

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