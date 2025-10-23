
import { GoogleGenAI, Modality } from "@google/genai";
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
  // Re-create client to ensure it uses the latest key from the dialog
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

export const generateAppWithCodey = async (prompt: string, apiKey: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    const fullPrompt = `Generate a complete, single-file React component in TypeScript using functional components and hooks. The component should be styled with Tailwind CSS. The user's request is: "${prompt}". Make sure to include all necessary imports.`;

    // Note: Using a "preview" model, which may not be suitable for production.
    const response = await ai.models.generateContent({
      model: 'codey-2.0-preview',
      contents: {
          parts: [{ text: fullPrompt }]
      },
    });

    if (response.candidates && response.candidates[0].content.parts.length > 0) {
      const codePart = response.candidates[0].content.parts[0];
      if (codePart.text) {
          // A more robust way to handle the model's response format
          const code = codePart.text.trim();
          if (code.startsWith('```typescript')) {
            return code.substring('```typescript'.length, code.length - 3).trim();
          }
          return code;
      }
    }

    throw new Error("App generation failed or returned no code.");
  };
