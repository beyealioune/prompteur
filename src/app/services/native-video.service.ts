// src/app/services/native-video.service.ts

import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';

declare let VideoRecorder: any; // Cordova global object
interface Window {
  VideoRecorder?: any;
}
declare var window: Window;

@Injectable({ providedIn: 'root' })
export class NativeVideoService {
  recordVideo(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window['VideoRecorder']) {
        reject('VideoRecorder plugin not available');
        return;
      }
      window['VideoRecorder'].recordVideo(
        (videoUri: string) => resolve(videoUri),
        (err: any) => reject(err),
        {
          camera: "front", // "front" ou "back"
          duration: 180,    // durée max en secondes
          limit: 1
        }
      );
    });
  }

  async getBlobFromFileUri(fileUri: string): Promise<Blob> {
    const path = fileUri.replace('file://', '');
    const readFile = await Filesystem.readFile({ path });
  
    if (typeof readFile.data === 'string') {
      // Cas natif : base64 string
      const byteCharacters = atob(readFile.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'video/mp4' });
    } else if (readFile.data instanceof Blob) {
      // Cas web : déjà un Blob
      return readFile.data;
    } else {
      throw new Error("Format de donnée inattendu lors de la lecture du fichier vidéo.");
    }
  }
  
}
