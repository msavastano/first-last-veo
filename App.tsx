import React, { useState, useCallback } from 'react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import SideMenu from './components/SideMenu';
import PromptEnhancer from './components/PromptEnhancer';
import Home from './components/Home';
import { View } from './types';

const Header = () => (
  <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-20 border-b border-gray-700">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Creative Suite AI
      </h1>
    </div>
  </header>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return process.env.API_KEY || process.env.GEMINI_API_KEY || null;
  });

  const renderContent = useCallback(() => {
    if (!apiKey) {
        return null;
    }
    switch (activeView) {
      case 'home':
        return <Home setActiveView={setActiveView} />;
      case 'image-gen':
        return <ImageGenerator apiKey={apiKey} />;
      case 'image-edit':
        return <ImageEditor apiKey={apiKey} />;
      case 'video-gen':
        return <VideoGenerator apiKey={apiKey} />;
      case 'prompt-enhancer':
        return <PromptEnhancer apiKey={apiKey} />;
      default:
        return <Home setActiveView={setActiveView} />;
    }
  }, [activeView, apiKey]);

  if (!apiKey) {
    return <ApiKeyPrompt onApiKeySubmit={setApiKey} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <div className="flex">
        <SideMenu activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-grow p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)]">
           <div>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;