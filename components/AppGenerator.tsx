
import React, { useState } from 'react';
import Spinner from './Spinner';
import { generateAppWithCodey } from '../services/geminiService';

const AppGenerator: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const code = await generateAppWithCodey(prompt, apiKey);
      setGeneratedCode(code);
    } catch (err) {
      setError('Failed to generate app. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-purple-400">App Generator</h2>
      <p className="text-gray-400 mb-6">
        Describe the web application you want to create, and the AI will generate the code for you.
      </p>
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., a simple todo list app with a text input and a button to add items"
          className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          {isLoading ? <Spinner /> : 'Generate App'}
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {generatedCode && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Generated Code</h3>
          <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto">
            <code className="text-sm text-gray-300">{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default AppGenerator;
