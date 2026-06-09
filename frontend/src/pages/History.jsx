import React, { useEffect, useState } from 'react';
import { getOrCreateUserId } from '../utils/user';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getOrCreateUserId();
        
        // TODO: change it when doing dockerization
        // Note that we only fetch history for a specific user_id
        const response = await fetch(`http://localhost:8000/predictions/?user_id=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prediction history');
        }
        
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-brand-mauve/30 text-white/80 uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Age</th>
                  <th className="p-4 font-semibold">Glucose</th>
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
                    <td className="p-4 text-white/80">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-white/80">{record.age}</td>
                    <td className="p-4 text-white/80">{record.glucose}</td>
                    <td className="p-4 text-white/80">{record.bmi.toFixed(1)}</td>
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