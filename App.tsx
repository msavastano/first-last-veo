
import React, { useState, useCallback } from 'react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import SideMenu from './components/SideMenu';
import PromptEnhancer from './components/PromptEnhancer';
import Home from './components/Home';
import { View } from './types';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A855F7"/>
        <stop offset="100%" stopColor="#EC4899"/>
      </linearGradient>
    </defs>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="url(#logo-gradient)"/>
    <path d="M12 7L13.5 10.5L17 12L13.5 13.5L12 17L10.5 13.5L7 12L10.5 10.5L12 7Z" fill="white"/>
  </svg>
);

const Header = () => (
  <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-20 border-b border-gray-700">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center">
        <Logo />
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Creative Suite AI
        </h1>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(window.innerWidth < 768);
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
        <SideMenu 
            activeView={activeView} 
            setActiveView={setActiveView} 
            isCollapsed={isMenuCollapsed}
            setCollapsed={setIsMenuCollapsed}
        />
        <main className="flex-grow p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)] transition-all duration-300 ease-in-out">
           <div>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
