export type Tab = 'image-gen' | 'image-edit' | 'video-gen';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export interface ImageData {
  base64: string;
  mimeType: string;
}

// FIX: Add global declaration for window.aistudio to provide a single source of truth for its type.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Made 'aistudio' optional to resolve: All declarations of 'aistudio' must have identical modifiers.
    aistudio?: AIStudio;
  }
}
