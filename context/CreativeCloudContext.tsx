
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ImageData } from '../types';

interface CreativeCloudState {
  savedPrompts: string[];
  savedImages: ImageData[];
}

interface CreativeCloudContextValue extends CreativeCloudState {
  addPrompt: (prompt: string) => void;
  addImage: (image: Omit<ImageData, 'id' | 'previewUrl'>, previewUrl: string) => void;
}

const CreativeCloudContext = createContext<CreativeCloudContextValue | undefined>(undefined);

export const CreativeCloudProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<ImageData[]>([]);

  const addPrompt = useCallback((prompt: string) => {
    if (!prompt) return;
    setSavedPrompts(prev => {
        if (prev.includes(prompt)) return prev;
        return [prompt, ...prev];
    });
  }, []);

  const addImage = useCallback((image: Omit<ImageData, 'id' | 'previewUrl'>, previewUrl: string) => {
    const newImage: ImageData = {
      ...image,
      id: `${Date.now()}-${Math.random()}`,
      previewUrl: previewUrl,
    };
    setSavedImages(prev => {
        if (prev.some(img => img.base64 === newImage.base64)) return prev;
        return [newImage, ...prev];
    });
  }, []);

  const value = { savedPrompts, savedImages, addPrompt, addImage };

  return (
    <CreativeCloudContext.Provider value={value}>
      {children}
    </CreativeCloudContext.Provider>
  );
};

export const useCreativeCloud = () => {
  const context = useContext(CreativeCloudContext);
  if (context === undefined) {
    throw new Error('useCreativeCloud must be used within a CreativeCloudProvider');
  }
  return context;
};
