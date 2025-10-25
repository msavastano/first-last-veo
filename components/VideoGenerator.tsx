import React, { useState, useCallback } from 'react';
import { generateImageWithImagen, generateLastFrameWithNano, generateVideoWithVeo } from '../services/geminiService';
import Spinner from './Spinner';
import { AspectRatio, ImageData } from '../types';
import { fileToImageData } from '../utils/fileUtils';

type Workflow = 'generate' | 'upload';

enum GenerateStage {
  PROMPT,
  FRAMES,
}

const VideoGenerator: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [generateStage, setGenerateStage] = useState<GenerateStage>(GenerateStage.PROMPT);
  
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [firstFrame, setFirstFrame] = useState<ImageData | null>(null);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const [firstFramePreviewUrl, setFirstFramePreviewUrl] = useState<string | null>(null);
  const [lastFramePreviewUrl, setLastFramePreviewUrl] = useState<string | null>(null);

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
      const firstFrameBase64 = await generateImageWithImagen(prompt, aspectRatio, apiKey);
      const firstFrameData = { base64: firstFrameBase64, mimeType: 'image/png' };
      setFirstFrame(firstFrameData);
      setIsLoadingFirst(false);

      setIsLoadingLast(true);
      const lastFrameBase64 = await generateLastFrameWithNano(prompt, firstFrameData, apiKey);
      setLastFrame({ base64: lastFrameBase64, mimeType: 'image/png' });
      setGenerateStage(GenerateStage.FRAMES);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while generating frames.');
    } finally {
      setIsLoadingFirst(false);
      setIsLoadingLast(false);
    }
  }, [prompt, aspectRatio, apiKey]);

  const handleGenerateVideo = useCallback(async () => {
    if (!firstFrame || !lastFrame || !prompt) {
      setError('A prompt and both start and end frames are required to generate a video.');
      return;
    }
    setIsLoadingVideo(true);
    setError(null);
    setGeneratedVideoUrl(null);
    try {
      const videoUrl = await generateVideoWithVeo(prompt, firstFrame, lastFrame, aspectRatio, setVideoStatus, apiKey);
      setGeneratedVideoUrl(videoUrl);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during video generation.');
    } finally {
      setIsLoadingVideo(false);
      setVideoStatus('');
    }
  }, [prompt, firstFrame, lastFrame, aspectRatio, apiKey]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    frameSetter: React.Dispatch<React.SetStateAction<ImageData | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      try {
        const imageData = await fileToImageData(file);
        frameSetter(imageData);
        previewSetter(URL.createObjectURL(file));
      } catch(err) {
        setError("Could not read the selected file.");
        frameSetter(null);
        previewSetter(null);
      }
    }
  };

  const handleStartOver = () => {
    setWorkflow(null);
    setGenerateStage(GenerateStage.PROMPT);
    setPrompt('');
    setFirstFrame(null);
    setLastFrame(null);
    setGeneratedVideoUrl(null);
    setFirstFramePreviewUrl(null);
    setLastFramePreviewUrl(null);
    setError(null);
    setIsLoadingFirst(false);
    setIsLoadingLast(false);
    setIsLoadingVideo(false);
  };
  
  const aspectRatios: AspectRatio[] = ['16:9', '9:16'];

  const renderChoice = () => (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4 text-gray-300">How would you like to create your video?</h3>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => setWorkflow('generate')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
          Generate Frames from a Prompt
        </button>
        <button onClick={() => setWorkflow('upload')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
          Upload My Own Frames
        </button>
      </div>
    </div>
  );

  const renderGenerateWorkflow = () => (
    <>
      {generateStage === GenerateStage.PROMPT && (
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

      {(isLoadingFirst || isLoadingLast || firstFrame || lastFrame) && (
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

      {generateStage === GenerateStage.FRAMES && !isLoadingFirst && !isLoadingLast && (
        <div className="mt-6 flex justify-center gap-4">
           <button onClick={handleStartOver} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">Start Over</button>
           <button onClick={handleGenerateVideo} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">Generate Video</button>
        </div>
      )}
    </>
  );

  const renderUploadWorkflow = () => (
    <div className="space-y-6">
        <div>
            <label htmlFor="prompt-upload" className="block text-sm font-medium text-gray-300 mb-1">Scene Description (Prompt)</label>
            <textarea
                id="prompt-upload"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cat chasing a laser dot across the floor"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                rows={2}
            />
             <p className="text-xs text-gray-400 mt-1">A prompt is still needed to guide the video generation between the frames.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">First Frame</h3>
                <div className="w-full min-h-[200px] flex items-center justify-center aspect-video bg-gray-900/50 rounded">
                    {firstFramePreviewUrl ? 
                        <img src={firstFramePreviewUrl} alt="First frame preview" className="max-w-full max-h-[30vh] rounded-lg" /> :
                        <p className="text-gray-500">Upload start frame</p>
                    }
                </div>
                <label htmlFor="first-frame-upload" className="cursor-pointer mt-4 w-full text-center p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                    {firstFrame ? 'Change First Frame' : 'Upload First Frame'}
                </label>
                <input id="first-frame-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setFirstFrame, setFirstFramePreviewUrl)} />
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Last Frame</h3>
                <div className="w-full min-h-[200px] flex items-center justify-center aspect-video bg-gray-900/50 rounded">
                    {lastFramePreviewUrl ? 
                        <img src={lastFramePreviewUrl} alt="Last frame preview" className="max-w-full max-h-[30vh] rounded-lg" /> :
                        <p className="text-gray-500">Upload end frame</p>
                    }
                </div>
                <label htmlFor="last-frame-upload" className="cursor-pointer mt-4 w-full text-center p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                    {lastFrame ? 'Change Last Frame' : 'Upload Last Frame'}
                </label>
                <input id="last-frame-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setLastFrame, setLastFramePreviewUrl)} />
            </div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-4">
          <div>
            <label htmlFor="aspectRatioUpload" className="block text-sm font-medium text-gray-300 mb-1 text-center">Aspect Ratio</label>
            <select
                id="aspectRatioUpload"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
                {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
            </select>
           </div>
           <div className="flex justify-center gap-4 w-full">
            <button onClick={handleStartOver} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">Back</button>
            <button onClick={handleGenerateVideo} disabled={!firstFrame || !lastFrame || !prompt} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg">Generate Video</button>
           </div>
      </div>
    </div>
  );

  const getSubtitle = () => {
    if (isLoadingVideo) return "Please wait while we process your video...";
    if (generatedVideoUrl) return "Your video is ready! Play it below.";
    switch (workflow) {
      case 'generate':
        return 'Describe a scene, review the start/end frames, and generate a video.';
      case 'upload':
        return 'Upload start and end frames, describe the scene, and generate a video.';
      default:
        return 'Generate a video from a prompt or by uploading your own start and end frames.';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Video Generation</h2>
      <p className="text-center text-gray-400 mb-8 h-5">{getSubtitle()}</p>

      {isLoadingVideo ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
          <p className="text-lg text-gray-300 mt-4 animate-pulse">{videoStatus || 'Generating your video...'}</p>
        </div>
      ) : generatedVideoUrl ? (
        <div className="flex flex-col items-center">
            <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full rounded-lg shadow-2xl"></video>
            <button onClick={handleStartOver} className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg">Create Another Video</button>
        </div>
      ) : (
          <div className="min-h-[400px]">
            {error && <p className="text-red-400 my-4 text-center">{error}</p>}
            {!workflow && renderChoice()}
            {workflow === 'generate' && renderGenerateWorkflow()}
            {workflow === 'upload' && renderUploadWorkflow()}
          </div>
      )}
    </div>
  );
};

export default VideoGenerator;
