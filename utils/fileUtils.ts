
import { ImageData } from '../types';

export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      // result is "data:mime/type;base64,..."
      const base64String = reader.result.split(',')[1];
      resolve({ base64: base64String, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
