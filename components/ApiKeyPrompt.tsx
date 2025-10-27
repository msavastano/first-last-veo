import React, { useState } from 'react';

interface ApiKeyPromptProps {
  onApiKeySubmit: (key: string) => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-purple-500/50">
        <h3 className="text-2xl font-bold text-purple-500 dark:text-purple-400 mb-4">Enter Your API Key</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          To use the Creative Suite AI, please provide your Google AI API key. The app first checks for an API_KEY environment variable. If not found, you can enter it manually here.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-center"
            aria-label="API Key Input"
          />
          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
          >
            Start Creating
          </button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          You can get your API key from{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
            Google AI Studio
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;