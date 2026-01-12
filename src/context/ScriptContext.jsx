import React, { createContext, useState, useContext } from 'react';

const ScriptContext = createContext();

export const useScript = () => useContext(ScriptContext);

export const ScriptProvider = ({ children }) => {
    const [script, setScript] = useState('');
    const [title, setTitle] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scenes, setScenes] = useState([]);

    const value = {
        script,
        setScript,
        title,
        setTitle,
        wordCount,
        setWordCount,
        isGenerating,
        setIsGenerating,
        scenes,
        setScenes
    };

    return (
        <ScriptContext.Provider value={value}>
            {children}
        </ScriptContext.Provider>
    );
};
