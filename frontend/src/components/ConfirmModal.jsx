import React, { useState, useEffect } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm" }) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Listening for changes to the `isOpen` prop to trigger the animation logic.
  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-full max-w-sm bg-[#221731] border border-brand-mauve/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 transform transition-all duration-200 ease-out ${animate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ff7b7b]/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#ff7b7b]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        </div>
        
        <p className="text-white/70 text-sm leading-relaxed pl-1">
          {message}
        </p>
        
        <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-bold text-black bg-[#ff7b7b] hover:bg-[#ff5252] rounded-xl transition-transform active:scale-95 shadow-lg shadow-[#ff7b7b]/20 cursor-pointer"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;