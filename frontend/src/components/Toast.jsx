import React, { useEffect, useState } from 'react';

const Toast = ({ message, type, id, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // After the fade-out duration (which you'll define in CSS), dismiss it fully
            const dismissTimer = setTimeout(() => onDismiss(id), 500); // Match CSS fade-out duration
            return () => clearTimeout(dismissTimer);
        }, 3000); // Toast visible for 3 seconds

        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    if (!isVisible && !message) return null; // Don't render if not visible and no message

    return (
        <div className={`toast-notification toast-${type} ${isVisible ? 'show' : 'hide'}`}>
            {message}
        </div>
    );
};

export default Toast;