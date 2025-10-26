
import React, { useState, useCallback } from 'react';
import { generateImageWithImagen } from '../services/geminiService';
import Spinner from './Spinner';
import { AspectRatio } from '../types';
import { useCreativeCloud } from '../context/CreativeCloudContext';

const ImageGenerator: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { addImage, savedPrompts } = useCreativeCloud();

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setSaveSuccess(false);
    try {
      const imageBytes = await generateImageWithImagen(prompt, aspectRatio, apiKey);
      setGeneratedImage(`data:image/png;base64,${imageBytes}`);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, apiKey]);

  const handleSaveImage = () => {
    if (!generatedImage) return;
    const [header, base64] = generatedImage.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    addImage({ base64, mimeType }, generatedImage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Image Generation</h2>
      <p className="text-center text-gray-400 mb-6">Describe an image and let Imagen bring it to life.</p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic lion wearing a crown, photorealistic"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
          rows={3}
          disabled={isLoading}
        />
        <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="w-full sm:w-auto">
                <label htmlFor="savedPrompts" className="block text-sm font-medium text-gray-300 mb-1">Load Saved Prompt</label>
                <select
                    id="savedPrompts"
                    onChange={(e) => e.target.value && setPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading || savedPrompts.length === 0}
                    value=""
                >
                    <option value="">{savedPrompts.length > 0 ? 'Select a prompt...' : 'No saved prompts'}</option>
                    {savedPrompts.map((p, i) => <option key={i} value={p}>{p.substring(0, 40)}...</option>)}
                </select>
            </div>
            <div className="w-full sm:w-auto">
                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                <select
                    id="aspectRatio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                >
                    {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                </select>
            </div>
            <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full sm:w-auto mt-5 sm:mt-0 flex-grow bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
            {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      <div className="mt-8 min-h-[300px] bg-gray-700/50 rounded-lg flex items-center justify-center p-4 relative">
        {isLoading ? (
          <Spinner />
        ) : generatedImage ? (
          <>
            <img src={generatedImage} alt="Generated" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
            <button
                onClick={handleSaveImage}
                className="absolute top-3 right-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-400"
                disabled={saveSuccess}
              >
                {saveSuccess ? 'Saved!' : 'Save to Library'}
              </button>
          </>
        ) : (
          <p className="text-gray-500">Your generated image will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
