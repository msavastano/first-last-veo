
import React, { useState, useCallback } from 'react';
import { generateImageWithImagen } from '../services/geminiService';
import Spinner from './Spinner';
import { AspectRatio } from '../types';

const ImageGenerator: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageBytes = await generateImageWithImagen(prompt, aspectRatio, apiKey);
      setGeneratedImage(`data:image/png;base64,${imageBytes}`);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, apiKey]);

  const handleReset = () => {
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
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
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg"
            >
              Reset
            </button>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      <div className="mt-8 min-h-[300px] bg-gray-700/50 rounded-lg flex items-center justify-center p-4">
        {isLoading ? (
          <Spinner />
        ) : generatedImage ? (
          <img src={generatedImage} alt="Generated" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
        ) : (
          <p className="text-gray-500">Your generated image will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
