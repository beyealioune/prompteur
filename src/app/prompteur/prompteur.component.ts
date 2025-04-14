import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy
} from '@angular/core';
import { VideoService } from '../services/video.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PaymentPopupComponent } from "../payment-popup/payment-popup.component";
import { SessionService } from '../services/session.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-prompteur',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
    PaymentPopupComponent
  ],
  templateUrl: './prompteur.component.html',
  styleUrl: './prompteur.component.css',
})
export class PrompteurComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('texteElement') texteElement!: ElementRef<HTMLDivElement>;

  texte: string = `Bienvenue sur notre application prompteur.`;
  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  stream: MediaStream | null = null;
  vitesse: number = 20;
  countdown: number = 0;
  isFullscreen = false;
  recordingTime = 0;
  timerInterval: any;
  showPaymentPopup = false;
  isScrolling = true;
  private videoBlobUrl: string | null = null;

  constructor(
    private videoService: VideoService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
    }
  }

  ngAfterViewInit() {
    this.scrollTexte();
  }

  ngOnDestroy() {
    this.cleanupResources();
  }

  private cleanupResources() {
    this.stopRecording();
    this.stopCamera();
    if (this.videoBlobUrl) {
      URL.revokeObjectURL(this.videoBlobUrl);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const video = this.videoElement.nativeElement;
    video.srcObject = null;
    video.src = '';
  }

  async startCamera() {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
      return;
    }

    this.stopCamera();

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        webUseInput: true
      });

      if (!image.dataUrl) {
        throw new Error('No data URL returned from camera');
      }

      const video = this.videoElement.nativeElement;
      video.src = image.dataUrl;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      // Créer un stream factice pour la compatibilité avec MediaRecorder
      this.stream = await this.createDummyStream(video);

      await video.play().catch(e => {
        console.error('Playback error:', e);
        // Solution de repli pour iOS
        if (this.isIOS()) {
          document.addEventListener('click', () => video.play(), { once: true });
        }
      });

    } catch (err) {
      console.error('Camera error:', err);
      alert(`Camera error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async createDummyStream(videoElement: HTMLVideoElement): Promise<MediaStream> {
    // Cette méthode crée un stream compatible avec MediaRecorder
    try {
      // Essayez d'abord de capturer le flux depuis l'élément vidéo
      if ('captureStream' in videoElement) {
        return (videoElement as any).captureStream();
      }
      // Fallback: utilisez getUserMedia si captureStream n'est pas disponible
      return await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
    } catch (e) {
      console.warn('Failed to create dummy stream:', e);
      throw new Error('Could not create recording stream');
    }
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  startRecording() {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
      return;
    }

    if (!this.stream) {
      alert('Veuillez d\'abord démarrer la caméra');
      return;
    }

    this.countdown = 3;

    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.startMediaRecorder();
      }
    }, 1000);
  }

  private startMediaRecorder() {
    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream!);

      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.previewRecording(blob);
        this.uploadVideo(blob);
      };

      this.mediaRecorder.start();
      this.startRecordingTimer();
      this.isRecording = true;
      this.scrollTexte();

    } catch (err) {
      console.error('Recording error:', err);
      alert('Erreur lors du démarrage de l\'enregistrement');
    }
  }

  private startRecordingTimer() {
    this.recordingTime = 0;
    this.timerInterval = setInterval(() => {
      this.recordingTime++;
    }, 1000);
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    clearInterval(this.timerInterval);
    this.isRecording = false;
  }

  private uploadVideo(blob: Blob) {
    this.videoService.uploadVideo(blob).subscribe({
      next: (message) => console.log('Upload successful:', message),
      error: (err) => console.error('Upload error:', err)
    });
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => this.isFullscreen = true)
        .catch(console.error);
    } else {
      document.exitFullscreen()
        .then(() => this.isFullscreen = false)
        .catch(console.error);
    }
  }

  scrollTexte() {
    this.isScrolling = false;
    setTimeout(() => {
      this.isScrolling = true;
    }, 10);
  }

  private previewRecording(blob: Blob) {
    if (this.videoBlobUrl) {
      URL.revokeObjectURL(this.videoBlobUrl);
    }

    this.videoBlobUrl = URL.createObjectURL(blob);
    const video = this.videoElement.nativeElement;
    
    video.srcObject = null;
    video.src = this.videoBlobUrl;
    video.setAttribute('controls', 'true');
    
    video.play().catch(e => console.error('Playback error:', e));
  }
}