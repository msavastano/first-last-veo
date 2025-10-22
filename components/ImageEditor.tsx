
import React, { useState, useCallback } from 'react';
import { editImageWithNano } from '../services/geminiService';
import Spinner from './Spinner';
import { fileToImageData } from '../utils/fileUtils';
import { ImageData } from '../types';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setEditedImage(null);
      try {
        const imageData = await fileToImageData(file);
        setOriginalImage(imageData);
        setOriginalImageUrl(URL.createObjectURL(file));
      } catch(err) {
        setError("Could not read the selected file.");
        setOriginalImage(null);
        setOriginalImageUrl(null);
      }
    }
  };

  const handleEdit = useCallback(async () => {
    if (!prompt || !originalImage) {
      setError('Please upload an image and provide an editing instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const imageBytes = await editImageWithNano(prompt, originalImage);
      setEditedImage(`data:image/png;base64,${imageBytes}`);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during editing.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, originalImage]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Image Editor</h2>
      <p className="text-center text-gray-400 mb-6">Upload an image and describe your edits.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
          <label htmlFor="image-upload" className="cursor-pointer w-full text-center p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-teal-400 transition-colors">
            {originalImageUrl ? 'Click to change image' : 'Click to upload an image'}
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
        </div>
        
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a retro filter, or remove the person in the background"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 transition-shadow"
            rows={3}
            disabled={isLoading || !originalImage}
          />
          <button
            onClick={handleEdit}
            disabled={isLoading || !prompt || !originalImage}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
          >
            {isLoading ? 'Editing...' : 'Apply Edits'}
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="min-h-[300px] bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Original</h3>
          {originalImageUrl ? (
            <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[50vh] rounded-lg shadow-lg" />
          ) : (
            <p className="text-gray-500">Upload an image to start.</p>
          )}
        </div>
        <div className="min-h-[300px] bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Edited</h3>
          {isLoading ? (
            <Spinner />
          ) : editedImage ? (
            <img src={editedImage} alt="Edited" className="max-w-full max-h-[50vh] rounded-lg shadow-lg" />
          ) : (
            <p className="text-gray-500">Your edited image will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
