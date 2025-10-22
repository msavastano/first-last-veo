
import React, { useState, useCallback } from 'react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ApiKeySelector from './components/ApiKeySelector';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import { Tab } from './types';

const Header = () => (
  <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Creative Suite AI
      </h1>
    </div>
  </header>
);

const TabSelector: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'image-gen', label: 'Image Generation' },
    { id: 'image-edit', label: 'Image Editing' },
    { id: 'video-gen', label: 'Video Generation' },
  ];

  return (
    <nav className="flex justify-center my-6 border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-3 font-medium text-lg transition-colors duration-300 ${
            activeTab === tab.id
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('image-gen');
  const [apiKey, setApiKey] = useState<string | null>(() => {
    // Use the Vite-exposed environment variable.
    return import.meta.env.VITE_GEMINI_API_KEY || null;
  });

  // If no API key is found from the environment (e.g., when running locally
  // without a build process), prompt the user to enter one.
  if (!apiKey) {
    return <ApiKeyPrompt onApiKeySubmit={setApiKey} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* ApiKeySelector is a specific flow for Veo model usage within AI Studio */}
        <ApiKeySelector isVideoTabActive={activeTab === 'video-gen'}>
          <div className="mt-4">
            <div style={{ display: activeTab === 'image-gen' ? 'block' : 'none' }}>
              <ImageGenerator apiKey={apiKey} />
            </div>
            <div style={{ display: activeTab === 'image-edit' ? 'block' : 'none' }}>
              <ImageEditor apiKey={apiKey} />
            </div>
            <div style={{ display: activeTab === 'video-gen' ? 'block' : 'none' }}>
              <VideoGenerator apiKey={apiKey} />
            </div>
          </div>
        </ApiKeySelector>
      </main>
    </div>
  );
};

export default App;
