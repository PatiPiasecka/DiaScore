import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(56, 42, 79, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#ffffff',
          border: '1px solid rgba(141, 117, 179, 0.4)',
          borderRadius: '16px',
          padding: '16px 24px',
          fontSize: '15px',
          fontWeight: '500',
          letterSpacing: '0.02em',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        
        // Error styles
        error: {
          iconTheme: { 
            primary: '#ff7b7b',
            secondary: 'rgba(56, 42, 79, 0.9)'
          },
        },

        // Success styles
        success: {
          iconTheme: { 
            primary: '#84ff9f',
            secondary: 'rgba(56, 42, 79, 0.9)' 
          },
        },
      }}
    />
  );
};

export default ToastProvider;