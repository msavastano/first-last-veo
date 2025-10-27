import React, { useState, useCallback } from 'react';
import { editImageWithNano } from '../services/geminiService';
import Spinner from './Spinner';
import { fileToImageData } from '../utils/fileUtils';
import { ImageData } from '../types';
import { useCreativeCloud } from '../context/CreativeCloudContext';

const ImageEditor: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { addImage, savedImages } = useCreativeCloud();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setEditedImage(null);
      try {
        const imageData = await fileToImageData(file);
        const objectUrl = URL.createObjectURL(file);
        setOriginalImage({...imageData, previewUrl: objectUrl});
        setOriginalImageUrl(objectUrl);
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
    setSaveSuccess(false);
    try {
      const imageBytes = await editImageWithNano(prompt, originalImage, apiKey);
      setEditedImage(`data:image/png;base64,${imageBytes}`);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during editing.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, originalImage, apiKey]);

  const handleSaveImage = () => {
    if (!editedImage) return;
    const [header, base64] = editedImage.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    addImage({ base64, mimeType }, editedImage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };
  
  const handleSelectFromLibrary = (image: ImageData) => {
    setOriginalImage(image);
    setOriginalImageUrl(image.previewUrl || null);
    setEditedImage(null);
    setError(null);
    setIsPickerOpen(false);
  }

  const ImagePickerModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsPickerOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 text-teal-500 dark:text-teal-400">Select an Image from Your Library</h3>
        {savedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedImages.map(image => (
              <button key={image.id} onClick={() => handleSelectFromLibrary(image)} className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden transform hover:scale-105 transition-transform focus:ring-2 ring-teal-400">
                <img src={image.previewUrl} alt="Saved asset" className="w-full h-40 object-cover"/>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Your library is empty. Save images from the Image Generator or Editor.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      {isPickerOpen && <ImagePickerModal />}
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Image Editor</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Upload an image and describe your edits.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-3">
           <label htmlFor="image-upload" className="cursor-pointer w-full text-center p-4 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-400 transition-colors">
            {originalImageUrl ? 'Change image...' : 'Upload an image...'}
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
           <p className="text-gray-500 dark:text-gray-400">or</p>
          <button 
            onClick={() => setIsPickerOpen(true)}
            disabled={isLoading || savedImages.length === 0}
            className="w-full p-4 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
          >
            Load from Library
          </button>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a retro filter, or remove the person in the background"
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 transition-shadow"
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
      
      {error && <p className="text-red-500 dark:text-red-400 mt-4 text-center">{error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="min-h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Original</h3>
          {originalImageUrl ? (
            <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[50vh] rounded-lg shadow-lg" />
          ) : (
            <p className="text-gray-500">Upload or load an image to start.</p>
          )}
        </div>
        <div className="min-h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4 relative">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Edited</h3>
          {isLoading ? (
            <Spinner />
          ) : editedImage ? (
            <>
              <img src={editedImage} alt="Edited" className="max-w-full max-h-[50vh] rounded-lg shadow-lg" />
              <button
                onClick={handleSaveImage}
                className="absolute top-3 right-3 bg-white/50 dark:bg-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-500/80 backdrop-blur-sm text-gray-800 dark:text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400"
                disabled={saveSuccess}
              >
                {saveSuccess ? 'Saved!' : 'Save to Library'}
              </button>
            </>
          ) : (
            <p className="text-gray-500">Your edited image will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;