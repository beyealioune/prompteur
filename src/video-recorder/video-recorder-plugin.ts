import { registerPlugin } from '@capacitor/core';

export interface RecordVideoOptions {
  quality?: 'high' | 'medium' | 'low';
  duration?: number;
  camera?: 'front' | 'back';
}

export interface RecordVideoResult {
  path: string;
}

export interface VideoRecorderPlugin {
  recordVideo(options: RecordVideoOptions): Promise<RecordVideoResult>;
}

export const VideoRecorder = registerPlugin<VideoRecorderPlugin>('VideoRecorder');
