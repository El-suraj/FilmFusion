// frontend/src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Make sure ReactDOM is imported for createPortal

const ToastContext = createContext();

// Custom hook to provide a more descriptive error if used outside provider
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Simple Toast component for individual toast rendering
const Toast = ({ message, type, id, onClose }) => {
  return (
    <div className={`toast toast-${type}`} onClick={onClose} style={{
        // Basic styling for a toast message
        padding: '10px 15px',
        backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        minWidth: '200px',
        textAlign: 'center'
    }}>
      {message}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // This is the DOM element where toasts will be rendered (e.g., at the end of <body>)
  // You might want to create a specific div in your public/index.html like <div id="toast-root"></div>
  // and use document.getElementById('toast-root') instead of document.body
  const portalRoot = document.body;

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random(); // Use Math.random for better uniqueness if toasts are rapid
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children} {/* This renders your entire application tree */}

      {/*
        This is where the toasts are rendered using a Portal.
        ReactDOM.createPortal returns a single React element (the div.toast-container),
        which is then the second child of ToastContext.Provider.
      */}
      {ReactDOM.createPortal(
        <div className="toast-container" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column-reverse', // New toasts appear at the bottom
            gap: '10px' // Space between toasts
        }}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              // Allow closing a toast manually by clicking it
              onClose={() => setToasts(prevToasts => prevToasts.filter(t => t.id !== toast.id))}
            />
          ))}
        </div>,
        portalRoot // Render the toasts into this DOM node
      )}
    </ToastContext.Provider>
  );
};