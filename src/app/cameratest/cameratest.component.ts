import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { VideoRecorder } from '../../../video-recorder/ios/Sources/VideoRecorderPlugin/video-recorder-plugin';

@Component({
  selector: 'app-cameratest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cameratest.component.html',
  styleUrl: './cameratest.component.css'
})
export class CameratestComponent {
  videoPath: string | null = null;
  error: string | null = null;

  async openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      videoElement.srcObject = stream;
      videoElement.play();
    } catch (err: any) {
      this.error = 'Erreur d’accès à la caméra : ' + err.message;
      console.error(err);
    }
  }

  async simulateRecord() {
    try {
      const result = await VideoRecorder.recordVideo({
        quality: 'high',
        duration: 0,
        camera: 'front'
      });

      console.log('✅ Résultat plugin :', result);
      this.videoPath = result.path;

      const videoElement = document.querySelector('video') as HTMLVideoElement;
      videoElement.srcObject = null;
      videoElement.src = result.path;
      videoElement.setAttribute('controls', 'true');
      await videoElement.play();
    } catch (err: any) {
      this.error = 'Erreur plugin : ' + err.message;
      console.error(err);
    }
  }
}
