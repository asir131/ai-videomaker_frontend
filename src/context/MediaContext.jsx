import React, { createContext, useState, useContext } from 'react';

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [imageGenerationProgress, setImageGenerationProgress] = useState(0);

    const [isRenderingVideo, setIsRenderingVideo] = useState(false);
    const [videoRenderProgress, setVideoRenderProgress] = useState(0);
    const [videoRenderStatus, setVideoRenderStatus] = useState('');
    const [renderedVideos, setRenderedVideos] = useState([]);

    const [audioDuration, setAudioDuration] = useState(0);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
    const [voiceGenerationProgress, setVoiceGenerationProgress] = useState(0);

    const value = {
        images,
        setImages,
        isGeneratingImages,
        setIsGeneratingImages,
        imageGenerationProgress,
        setImageGenerationProgress,
        isRenderingVideo,
        setIsRenderingVideo,
        videoRenderProgress,
        setVideoRenderProgress,
        videoRenderStatus,
        setVideoRenderStatus,
        renderedVideos,
        setRenderedVideos,
        audioDuration,
        setAudioDuration,
        generatedAudioUrl,
        setGeneratedAudioUrl,
        isGeneratingVoice,
        setIsGeneratingVoice,
        voiceGenerationProgress,
        setVoiceGenerationProgress
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};
