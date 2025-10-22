
import React, { useState, useCallback } from 'react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ApiKeySelector from './components/ApiKeySelector';
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

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'image-gen':
        return <ImageGenerator />;
      case 'image-edit':
        return <ImageEditor />;
      case 'video-gen':
        return <VideoGenerator />;
      default:
        return <ImageGenerator />;
    }
  }, [activeTab]);

  // This app is designed to run in an environment where API_KEY is set, like Google AI Studio.
  if (!process.env.API_KEY) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-red-500/50">
          <h3 className="text-2xl font-bold text-red-400 mb-4">Environment Error</h3>
          <p className="text-gray-300 mb-6">
            This application is designed to run within the Google AI Studio environment, which provides the necessary API key.
          </p>
          <p className="text-sm text-gray-400">
            Please open this application in Google AI Studio to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        <ApiKeySelector isVideoTabActive={activeTab === 'video-gen'}>
          <div className="mt-4">{renderContent()}</div>
        </ApiKeySelector>
      </main>
    </div>
  );
};

export default App;
