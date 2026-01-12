import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
        const id = Date.now() + Math.random();

        const toast = {
            id,
            type,
            message,
            duration
        };

        setToasts(prev => [...prev, toast]);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration = 3000) => {
        return showToast({ type: 'success', message, duration });
    }, [showToast]);

    const showError = useCallback((message, duration = 5000) => {
        return showToast({ type: 'error', message, duration });
    }, [showToast]);

    const showWarning = useCallback((message, duration = 4000) => {
        return showToast({ type: 'warning', message, duration });
    }, [showToast]);

    const showInfo = useCallback((message, duration = 3000) => {
        return showToast({ type: 'info', message, duration });
    }, [showToast]);

    const value = {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};
