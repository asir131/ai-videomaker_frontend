import React, { createContext, useState, useContext, useEffect } from 'react';
import { parseScriptIntoScenes } from '../utils/scriptUtils';

const ScriptContext = createContext();

export const useScript = () => useContext(ScriptContext);

export const ScriptProvider = ({ children }) => {
    const [script, setScript] = useState('');
    const [title, setTitle] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scenes, setScenes] = useState([]);
    const [sceneCount, setSceneCount] = useState(5);
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [userEdited, setUserEdited] = useState(false);

    // Sync scenes when script or sceneCount changes
    const updateScenes = (newScript, newCount, audioDuration = 0, flagAsUserEdited = false) => {
        if (!newScript) {
            setScenes([]);
            return;
        }
        const updatedScenes = parseScriptIntoScenes(newScript, newCount, audioDuration);
        setScenes(updatedScenes);

        if (flagAsUserEdited) {
            setUserEdited(true);
        }
    };

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
        setScenes,
        sceneCount,
        setSceneCount,
        updateScenes,
        selectedStyle,
        setSelectedStyle,
        userEdited,
        setUserEdited
    };

    return (
        <ScriptContext.Provider value={value}>
            {children}
        </ScriptContext.Provider>
    );
};
