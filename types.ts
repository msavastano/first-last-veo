export type View = 'image-gen' | 'image-edit' | 'video-gen' | 'prompt-enhancer';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export interface ImageData {
  base64: string;
  mimeType: string;
}
