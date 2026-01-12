import React, { createContext, useState, useContext, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [modals, setModals] = useState({
        imageGeneration: false,
        styleSelector: false,
        transitionSettings: false,
        youtubeUpload: false,
        context: false,
        wordCount: false
    });
    const [loading, setLoading] = useState({
        script: false,
        images: false,
        voice: false,
        video: false
    });

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode ? 'true' : 'false');
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const openModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
    };

    const value = {
        darkMode,
        toggleDarkMode,
        modals,
        openModal,
        closeModal,
        loading,
        setLoading
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};
