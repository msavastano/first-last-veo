
import React, { useState, useCallback } from 'react';
import { generateImageWithImagen, generateLastFrameWithNano, generateVideoWithVeo } from '../services/geminiService';
import Spinner from './Spinner';
import { AspectRatio, ImageData } from '../types';

enum Stage {
  PROMPT,
  FRAMES,
  VIDEO,
}

const VideoGenerator: React.FC = () => {
  const [stage, setStage] = useState<Stage>(Stage.PROMPT);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [firstFrame, setFirstFrame] = useState<ImageData | null>(null);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const [isLoadingFirst, setIsLoadingFirst] = useState(false);
  const [isLoadingLast, setIsLoadingLast] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFrames = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a scene description.');
      return;
    }
    setIsLoadingFirst(true);
    setError(null);
    setFirstFrame(null);
    setLastFrame(null);
    try {
      const firstFrameBase64 = await generateImageWithImagen(prompt, aspectRatio);
      const firstFrameData = { base64: firstFrameBase64, mimeType: 'image/png' };
      setFirstFrame(firstFrameData);
      setIsLoadingFirst(false);

      setIsLoadingLast(true);
      const lastFrameBase64 = await generateLastFrameWithNano(prompt, firstFrameData);
      setLastFrame({ base64: lastFrameBase64, mimeType: 'image/png' });
      setStage(Stage.FRAMES);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while generating frames.');
    } finally {
      setIsLoadingFirst(false);
      setIsLoadingLast(false);
    }
  }, [prompt, aspectRatio]);

  const handleGenerateVideo = useCallback(async () => {
    if (!firstFrame || !lastFrame) {
      setError('Cannot generate video without start and end frames.');
      return;
    }
    setIsLoadingVideo(true);
    setError(null);
    setGeneratedVideoUrl(null);
    try {
      const videoUrl = await generateVideoWithVeo(prompt, firstFrame, lastFrame, aspectRatio, setVideoStatus);
      setGeneratedVideoUrl(videoUrl);
      setStage(Stage.VIDEO);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during video generation.');
    } finally {
      setIsLoadingVideo(false);
      setVideoStatus('');
    }
  }, [prompt, firstFrame, lastFrame, aspectRatio]);

  const handleStartOver = () => {
    setStage(Stage.PROMPT);
    setPrompt('');
    setFirstFrame(null);
    setLastFrame(null);
    setGeneratedVideoUrl(null);
    setError(null);
  };
  
  const aspectRatios: AspectRatio[] = ['16:9', '9:16'];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Video Generation</h2>
      <p className="text-center text-gray-400 mb-6">Describe a scene, review the start/end frames, and generate a video.</p>

      {stage === Stage.PROMPT && (
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A spaceship landing on a mysterious alien planet with glowing flora"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            rows={3}
            disabled={isLoadingFirst || isLoadingLast}
          />
           <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="w-full sm:w-auto">
                <label htmlFor="aspectRatioVid" className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                <select
                    id="aspectRatioVid"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                    disabled={isLoadingFirst || isLoadingLast}
                >
                    {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                </select>
             </div>
             <button
              onClick={handleGenerateFrames}
              disabled={isLoadingFirst || isLoadingLast || !prompt}
              className="w-full sm:w-auto mt-5 sm:mt-0 flex-grow bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              {isLoadingFirst || isLoadingLast ? 'Generating Frames...' : 'Generate Start & End Frames'}
            </button>
           </div>
        </div>
      )}

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {(isLoadingFirst || isLoadingLast || firstFrame || lastFrame) && stage !== Stage.VIDEO && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="min-h-[300px] bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">First Frame</h3>
            {isLoadingFirst ? <Spinner /> : firstFrame && <img src={`data:image/png;base64,${firstFrame.base64}`} alt="Start Frame" className="max-w-full max-h-[40vh] rounded-lg"/>}
          </div>
          <div className="min-h-[300px] bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Last Frame</h3>
            {isLoadingLast ? <Spinner /> : lastFrame && <img src={`data:image/png;base64,${lastFrame.base64}`} alt="End Frame" className="max-w-full max-h-[40vh] rounded-lg"/>}
          </div>
        </div>
      )}

      {stage === Stage.FRAMES && !isLoadingFirst && !isLoadingLast && (
        <div className="mt-6 flex justify-center gap-4">
           <button onClick={handleStartOver} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">Start Over</button>
           <button onClick={handleGenerateVideo} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">Generate Video</button>
        </div>
      )}

      {isLoadingVideo && (
        <div className="mt-8 flex flex-col items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
          <p className="text-lg text-gray-300 mt-4 animate-pulse">{videoStatus || 'Generating your video...'}</p>
        </div>
      )}

      {stage === Stage.VIDEO && generatedVideoUrl && (
        <div className="mt-8 flex flex-col items-center">
            <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full rounded-lg shadow-2xl"></video>
            <button onClick={handleStartOver} className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg">Create Another Video</button>
        </div>
      )}

    </div>
  );
};

export default VideoGenerator;
