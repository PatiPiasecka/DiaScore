import React, { useEffect, useState } from 'react';

const Gauge = ({ percentage }) => {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // Small delay to trigger animation after mount
    const timer = setTimeout(() => {
      setAnimatedPct(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // 1% - 1.8 deg
  const rotation = -180 + (animatedPct * 1.8);

  let statusText = "LOW RISK";
  let statusColor = "text-[#4ade80]";
  let borderColor = "border-[#4ade80]";

  if (percentage > 33 && percentage <= 66) {
    statusText = "MODERATE RISK";
    statusColor = "text-[#facc15]";
    borderColor = "border-[#facc15]";
  } else if (percentage > 66) {
    statusText = "HIGH RISK";
    statusColor = "text-[#f87171]";
    borderColor = "border-[#f87171]";
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 transition-all duration-500">

      {/* Alert Icon (Optional, shows on high risk) */}
      {percentage > 66 && (
        <div className="mb-6 text-[#facc15] animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
      )}

      {/* SVG GAUGE */}
      <div className="relative w-full max-w-[340px]">
        <svg viewBox="0 0 300 170" className="w-full overflow-visible drop-shadow-2xl">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="10%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="90%" stopColor="#f87171" />
            </linearGradient>
            <mask id="arcMask">
              <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" />
            </mask>
          </defs>

          <g mask="url(#arcMask)">
            <rect x="0" y="0" width="300" height="170" fill="url(#gaugeGradient)" />
          </g>

          {/* Needle */}
          <g transform={`rotate(${rotation}, 150, 150)`} className="transition-transform duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
            <line x1="150" y1="150" x2="260" y2="150" stroke="white" strokeWidth="4" strokeLinecap="round" />
            {/* Needle center base */}
            <circle cx="150" cy="150" r="8" fill="#2d1a18" stroke="white" strokeWidth="3" />
            {/* Inner small dot */}
            <circle cx="150" cy="150" r="2" fill="white" />
          </g>

        </svg>

        {/* Text inside arc */}
        <div className="absolute top-[65px] left-0 w-full text-center flex flex-col items-center">
          <p className="text-[11px] text-white/60 tracking-[0.2em] uppercase font-bold mb-1">Overall Risk</p>
          <p className="text-4xl font-black text-white tracking-tighter drop-shadow-md">{animatedPct}%</p>
        </div>
      </div>

      {/* Status Pill */}
      <div className={`mt-6 px-8 py-2.5 rounded-full border-2 ${borderColor} bg-white/5 backdrop-blur-sm shadow-xl transition-colors duration-1000`}>
        <span className={`text-sm font-bold tracking-widest uppercase ${statusColor}`}>{statusText}</span>
      </div>

    </div>
  );
}

export default Gauge;
