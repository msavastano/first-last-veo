import { GoogleGenAI, Modality, Chat } from "@google/genai";
import { AspectRatio, ImageData } from '../types';

const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImageWithImagen = async (prompt: string, aspectRatio: AspectRatio, apiKey: string): Promise<string> => {
  const ai = getAiClient(apiKey);
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio,
    },
  });
  
  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  throw new Error("Image generation failed or returned no images.");
};

export const editImageWithNano = async (prompt: string, originalImage: ImageData, apiKey: string): Promise<string> => {
  const ai = getAiClient(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: originalImage.base64,
            mimeType: originalImage.mimeType,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("Image editing failed or returned no image data.");
};

export const generateLastFrameWithNano = async (prompt: string, firstFrame: ImageData, apiKey: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    const fullPrompt = `Based on the provided image and the description "${prompt}", generate a logical final frame for a short video. The generated image should represent the end of the story or action.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: firstFrame.base64,
              mimeType: firstFrame.mimeType,
            },
          },
          { text: fullPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("Last frame generation failed.");
  };

export const generateVideoWithVeo = async (
  prompt: string,
  firstFrame: ImageData,
  lastFrame: ImageData,
  aspectRatio: AspectRatio,
  onProgress: (status: string) => void,
  apiKey: string
): Promise<string> => {
  const ai = getAiClient(apiKey);

  onProgress("Initializing video generation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: {
      imageBytes: firstFrame.base64,
      mimeType: firstFrame.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
      lastFrame: {
        imageBytes: lastFrame.base64,
        mimeType: lastFrame.mimeType,
      },
    }
  });

  const progressMessages = [
    "Warming up the digital director...",
    "Setting up the scene...",
    "Action! Cameras are rolling...",
    "Processing dailies...",
    "In the editing room, adding final touches...",
    "Rendering the final cut..."
  ];
  let messageIndex = 0;

  while (!operation.done) {
    onProgress(progressMessages[messageIndex % progressMessages.length]);
    messageIndex++;
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation.error) {
      throw new Error(`Video generation failed: ${operation.error.message}`);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error("Video generation completed but no download link was found.");
  }
  
  onProgress("Fetching your masterpiece...");
  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};

export const enhancePrompt = async (
  userInput: string,
  promptType: 'Image' | 'Video',
  apiKey: string
): Promise<string> => {
  const ai = getAiClient(apiKey);
  const systemInstruction =
    promptType === 'Image'
      ? "You are an expert prompt engineer for generative AI image models like Imagen. Your task is to take a user's basic idea and expand it into a detailed, descriptive, and vivid prompt that will generate a high-quality, artistic image. Focus on details like lighting, composition, style (e.g., photorealistic, oil painting, cinematic), mood, and specific visual elements. Provide only the enhanced prompt as a single block of text, without any conversational preamble or explanation."
      : "You are an expert prompt engineer for generative AI video models like Veo. Your task is to take a user's basic idea and expand it into a detailed, descriptive prompt for a short video scene. Focus on describing the action, camera movement (e.g., dolly shot, panning), atmosphere, and visual style. The goal is a prompt that will generate a dynamic and cinematic video clip. Provide only the enhanced prompt as a single block of text, without any conversational preamble or explanation.";

  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });

  const response = await chat.sendMessage({ message: userInput });

  return response.text;
};