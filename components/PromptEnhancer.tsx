
import React, { useState, useCallback } from 'react';
import { enhancePrompt } from '../services/geminiService';
import Spinner from './Spinner';
import { useCreativeCloud } from '../context/CreativeCloudContext';

const PromptEnhancer: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [promptType, setPromptType] = useState<'Image' | 'Video'>('Image');
  const [userInput, setUserInput] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const { addPrompt, savedPrompts } = useCreativeCloud();

  const handleEnhance = useCallback(async () => {
    if (!userInput) {
      setError('Please enter a prompt to enhance.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEnhancedPrompt('');
    setCopySuccess(false);
    setSaveSuccess(false);
    try {
      const result = await enhancePrompt(userInput, promptType, apiKey);
      setEnhancedPrompt(result);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, promptType, apiKey]);

  const handleCopy = () => {
    if (enhancedPrompt) {
      navigator.clipboard.writeText(enhancedPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSave = () => {
    if (enhancedPrompt) {
      addPrompt(enhancedPrompt);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400">Prompt Enhancer</h2>
      <p className="text-center text-gray-400 mb-6">Refine your ideas into powerful prompts for better results.</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
                <label htmlFor="promptType" className="block text-sm font-medium text-gray-300 mb-1">Prompt For</label>
                <select
                    id="promptType"
                    value={promptType}
                    onChange={(e) => setPromptType(e.target.value as 'Image' | 'Video')}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading}
                >
                    <option value="Image">Image</option>
                    <option value="Video">Video</option>
                </select>
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-300 mb-1">Your Idea</label>
                 <input
                    type="text"
                    id="user-prompt"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., a cat in space"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    disabled={isLoading}
                />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
                <label htmlFor="savedPrompts" className="block text-sm font-medium text-gray-300 mb-1">Load Saved Prompt</label>
                <select
                    id="savedPrompts"
                    onChange={(e) => e.target.value && setUserInput(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading || savedPrompts.length === 0}
                    value=""
                >
                    <option value="">{savedPrompts.length > 0 ? 'Select a prompt...' : 'No saved prompts'}</option>
                    {savedPrompts.map((p, i) => <option key={i} value={p}>{p.substring(0, 40)}...</option>)}
                </select>
            </div>
            <div>
                <button
                    onClick={handleEnhance}
                    disabled={isLoading || !userInput}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                    >
                    {isLoading ? 'Enhancing...' : 'Enhance Prompt ✨'}
                </button>
            </div>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      <div className="mt-8 min-h-[200px] bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4 relative">
        {isLoading ? (
          <Spinner />
        ) : enhancedPrompt ? (
            <>
            <div className="absolute top-3 right-3 flex gap-2">
                <button 
                    onClick={handleSave}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-400"
                    disabled={saveSuccess}
                >
                    {saveSuccess ? 'Saved!' : 'Save'}
                </button>
                <button 
                    onClick={handleCopy}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors"
                >
                    {copySuccess ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap p-4 text-left w-full pt-10">{enhancedPrompt}</p>
            </>
        ) : (
          <p className="text-gray-500">Your enhanced prompt will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default PromptEnhancer;
