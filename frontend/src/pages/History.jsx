import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { downloadHistoryCSV } from '../utils/csvExport';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import HistoryTableRow from '../components/HistoryTableRow';

const History = () => {
  const { predictions, loading, error, deletePrediction, deleteAllPredictions } = useHistory();
  
  const [recordToDelete, setRecordToDelete] = useState(null); 
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const executeAction = async () => {
    if (isDeletingAll) {
      setIsDeletingAll(false);
      const result = await deleteAllPredictions();
      if (result.success) {
        toast.success('All records deleted successfully');
      } else {
        toast.error(result.message);
      }
    } else if (recordToDelete) {
      const id = recordToDelete;
      setRecordToDelete(null);
      const result = await deletePrediction(id);
      if (result.success) {
        toast.success('Record deleted successfully');
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleCloseModal = () => {
    setRecordToDelete(null);
    setIsDeletingAll(false);
  };

  return (
    <div className="w-full text-white flex flex-col font-sans items-center py-10 px-6 lg:px-12 relative">
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
        
        {!loading && !error && predictions.length > 0 && (
          <div className="w-full flex justify-end gap-4 mb-6">
            {/* Delete All Button */}
            <button
              onClick={() => setIsDeletingAll(true)}
              className="px-5 py-2.5 bg-transparent border border-[#ff7b7b]/50 text-[#ff7b7b] hover:bg-[#ff7b7b] hover:text-black font-bold rounded-2xl text-sm transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4m3 0v12a2 2 0 002 2h6a2 2 0 002-2V7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
              </svg>
              Delete All
            </button>

            {/* Export Button */}
            <button
              onClick={() => {
                downloadHistoryCSV(predictions);
                toast.success('History exported successfully!');
              }}
              className="px-5 py-2.5 bg-transparent border border-brand-lilac text-brand-lilac hover:bg-brand-lilac hover:text-black font-bold rounded-2xl text-sm transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          </div>
        )}

        {loading && <p className="text-center text-white/60 font-medium py-8 animate-pulse">Loading history...</p>}
        {error && <p className="text-center text-red-400 py-8">Error: {error}</p>}
        {!loading && !error && predictions.length === 0 && <p className="text-center text-white/60 py-8">No history saved. Make your first prediction!</p>}

        {!loading && !error && predictions.length > 0 && (
          <div className="overflow-x-auto w-full">
            <div className="min-w-[1000px] rounded-b-[20px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-mauve/30 text-white/80 uppercase text-xs tracking-wider">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Age</th>
                    <th className="p-4 font-semibold">Preg.</th>
                    <th className="p-4 font-semibold">Glucose</th>
                    <th className="p-4 font-semibold">BP</th>
                    <th className="p-4 font-semibold">Insulin</th>
                    <th className="p-4 font-semibold">BMI</th>
                    <th className="p-4 font-semibold text-right">Risk Score</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {predictions.map((record, index) => (
                    <HistoryTableRow 
                      key={record.id} 
                      record={record} 
                      isLast={index === predictions.length - 1} 
                      onDelete={setRecordToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!recordToDelete || isDeletingAll}
        onClose={handleCloseModal}
        onConfirm={executeAction}
        title={isDeletingAll ? "Delete all records?" : "Delete record?"}
        message={
          isDeletingAll 
            ? "Are you absolutely sure you want to delete all your predictions? This action cannot be undone and your entire history will be wiped." 
            : "Are you sure you want to delete this prediction from your history? This action cannot be undone."
        }
        confirmText="Yes, Delete"
      />

    </div>
  );
};

export default History;