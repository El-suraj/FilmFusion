// frontend/src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type, id, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let timer;
        let dismissTimer;

        // Only set the primary disappearance timer if the toast is meant to be visible
        if (isVisible) {
            timer = setTimeout(() => {
                setIsVisible(false); // Start fade-out animation

                // After fade-out, actually remove the toast from the DOM via onDismiss
                // The 500ms here should match the CSS transition duration for opacity/transform
                dismissTimer = setTimeout(() => onDismiss(id), 500);
            }, 3000); // Toast visible for 3 seconds before starting fade-out
        }

        // Cleanup function: Clear timers if the component unmounts or re-renders
        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
        };
    }, [id, onDismiss, isVisible]); // Dependencies: Re-run effect if ID, dismiss callback, or visibility state changes

    // Defensive programming: Ensure message and type are always strings
    // This prevents potential errors if they are null/undefined for some reason
    const safeMessage = message || 'An unexpected error occurred.'; // Provide a fallback message
    const safeType = type || 'info'; // Default type if somehow not provided

    // If the toast is explicitly set to not be visible and has no message, don't render anything
    // This handles cases where a toast might be dismissed quickly before its animation finishes
    if (!isVisible && !safeMessage) return null;

    return (
        <div className={`toast-notification toast-${safeType} ${isVisible ? 'show' : 'hide'}`}>
            {safeMessage}
        </div>
    );
};

export default Toast;