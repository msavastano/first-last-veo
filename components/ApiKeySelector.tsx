import React, { useState, useEffect } from 'react';
import { generateVideoWithVeo } from '../services/geminiService'; // Import a Veo function to test the key

interface ApiKeySelectorProps {
  children: React.ReactNode;
  isVideoTabActive: boolean;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ children, isVideoTabActive }) => {
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (!isVideoTabActive) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Prioritize environment variable
        if (import.meta.env.VITE_GEMINI_API_KEY) {
          setIsKeySelected(true);
        } else {
            // Fallback to AI Studio check
            // FIX: Added a check for window.aistudio since its type is now optional.
            const hasKey = window.aistudio ? await window.aistudio.hasSelectedApiKey() : false;
            setIsKeySelected(hasKey);
        }
      } catch (e) {
        console.error("Error checking for API key:", e);
        setError("Could not verify API key status. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    checkApiKey();
  }, [isVideoTabActive]);

  const handleSelectKey = async () => {
    try {
      // FIX: Added a check for window.aistudio since its type is now optional.
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success to avoid race conditions and provide immediate feedback
        setIsKeySelected(true); 
        setError(null);
      } else {
        setError("AI Studio features are not available in this environment.");
      }
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setError("Failed to open the API key selection dialog.");
    }
  };
  
  // Re-check key if a Veo-specific error occurs (handled in the component, but we can reset state here)
  const handleAuthError = () => {
    setIsKeySelected(false);
    setError("Your API key is invalid or not found. Please select a valid key.");
  };

  if (isLoading && isVideoTabActive) {
    return (
      <div className="flex justify-center items-center p-10">
        <p>Verifying API key status...</p>
      </div>
    );
  }

  if (isVideoTabActive && !isKeySelected) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-yellow-500/50">
        <h3 className="text-2xl font-bold text-yellow-400 mb-4">API Key Required for Video Generation</h3>
        <p className="text-gray-300 mb-6">
          The Veo video generation model requires a valid API key with billing enabled. Please select your key to proceed.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          For more information on billing, please visit the{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
            official documentation
          </a>.
        </p>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          onClick={handleSelectKey}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
        >
          Select Your API Key
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiKeySelector;
