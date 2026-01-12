import React from 'react';
import { useToast } from '../../context/ToastContext';
import Toast from './Toast';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none sm:w-auto w-[calc(100%-2rem)]"
            aria-live="polite"
            aria-atomic="false"
        >
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        {...toast}
                        onClose={removeToast}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
