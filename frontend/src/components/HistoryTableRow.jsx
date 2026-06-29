import React from 'react';

const HistoryTableRow = ({ record, isLast, onDelete }) => {
  const renderDataCell = (fieldKey, value) => {
    if (record.imputed_fields?.includes(fieldKey)) {
      return (
        <span className="text-white/40 italic font-semibold whitespace-nowrap" title="Imputed value">
          N/A
        </span>
      );
    }
    return value;
  };

  return (
    <tr className={`transition-colors hover:bg-white/5 ${!isLast ? 'border-b border-brand-mauve/10' : ''}`}>
      <td className="p-4 text-white/80 whitespace-nowrap">
        {new Date(record.created_at).toLocaleDateString()}
      </td>
      <td className="p-4 text-white/80">{record.age}</td>
      <td className="p-4 text-white/80">{record.pregnancies}</td>
      <td className="p-4 text-white/80">{renderDataCell('glucose', record.glucose)}</td>
      <td className="p-4 text-white/80">{renderDataCell('blood_pressure', record.blood_pressure)}</td>
      <td className="p-4 text-white/80">{renderDataCell('insulin', record.insulin)}</td>
      <td className="p-4 text-white/80">{renderDataCell('bmi', record.bmi?.toFixed(1))}</td>
      <td className="p-4 font-bold text-right">
        <span className={record.risk_score > 0.5 ? 'text-[#ff7b7b]' : 'text-[#84ff9f]'}>
          {(record.risk_score * 100).toFixed(1)}%
        </span>
      </td>
      <td className="p-4 text-right">
        <button
          onClick={() => onDelete(record.id)}
          className="inline-flex items-center justify-center p-[10px] bg-transparent border border-[#ff7b7b]/50 text-[#ff7b7b] hover:bg-[#ff7b7b] hover:text-black rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          title="Delete record"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4m3 0v12a2 2 0 002 2h6a2 2 0 002-2V7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default HistoryTableRow;