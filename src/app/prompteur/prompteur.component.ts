import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy
} from '@angular/core';
import { VideoService } from '../services/video.service';
import { SessionService } from '../services/session.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PaymentPopupComponent } from "../payment-popup/payment-popup.component";

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
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  stream: MediaStream | null = null;
  vitesse: number = 20; // secondes
  countdown = 0;
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

  ngAfterViewInit(): void {
    this.updateScrollSpeed();
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }

  private cleanupResources() {
    this.stopRecording();
    this.stopCamera();
    if (this.videoBlobUrl) {
      URL.revokeObjectURL(this.videoBlobUrl);
    }
  }

  updateScrollSpeed() {
    if (this.texteElement) {
      this.texteElement.nativeElement.style.setProperty('--scroll-speed', `${this.vitesse}s`);
    }
  }

  increaseSpeed() {
    this.vitesse = Math.max(5, this.vitesse - 5);
    this.updateScrollSpeed();
  }

  decreaseSpeed() {
    this.vitesse += 5;
    this.updateScrollSpeed();
  }

  async startCamera() {
    this.stopCamera();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      await video.play();
    } catch (err) {
      console.error('Camera error:', err);
      alert(`Erreur caméra: ${err instanceof Error ? err.message : String(err)}`);
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

  startRecording() {
    if (!this.stream) {
      alert('Veuillez d\'abord démarrer la caméra');
      return;
    }

    const preferredMimeType = this.isIOS() ? 'video/mp4' : 'video/webm';
    if (!this.isTypeSupported(preferredMimeType)) {
      alert(`Le format ${preferredMimeType} n'est pas supporté`);
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
      const options = {
        mimeType: this.isIOS() ? 'video/mp4' : 'video/webm',
        videoBitsPerSecond: 2500000
      };
      try {
        this.mediaRecorder = new MediaRecorder(this.stream!, options);
      } catch {
        this.mediaRecorder = new MediaRecorder(this.stream!);
      }

      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || 'video/mp4'
        });
        this.previewRecording(blob);
        this.uploadVideo(blob);
      };

      this.mediaRecorder.start(100);
      this.startRecordingTimer();
      this.isRecording = true;
      this.updateScrollSpeed();
    } catch (err) {
      console.error('Recording error:', err);
      alert('Erreur lors de l\'enregistrement: ' + (err instanceof Error ? err.message : String(err)));
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

  private previewRecording(blob: Blob) {
    if (this.videoBlobUrl) {
      URL.revokeObjectURL(this.videoBlobUrl);
    }
    this.videoBlobUrl = URL.createObjectURL(blob);
    const video = this.videoElement.nativeElement;
    video.srcObject = null;
    video.src = this.videoBlobUrl;
    video.setAttribute('controls', 'true');
    video.play().catch(console.error);
  }

  private uploadVideo(blob: Blob) {
    const extension = blob.type.includes('mp4') ? '.mp4' : '.webm';
    this.videoService.uploadVideo(blob, extension).subscribe({
      next: () => alert('Vidéo envoyée avec succès!'),
      error: (err) => alert('Erreur d\'upload: ' + err.message)
    });
  }

  toggleFullscreen(): void {
    const videoContainer = this.videoElement.nativeElement.parentElement;
    if (!document.fullscreenElement) {
      videoContainer?.requestFullscreen()
        .then(() => {
          this.isFullscreen = true;
          // Force un recalcul de l'animation
          this.texteElement.nativeElement.style.animation = 'none';
          setTimeout(() => {
            this.updateScrollSpeed();
          }, 10);
        })
        .catch(console.error);
    } else {
      document.exitFullscreen()
        .then(() => {
          this.isFullscreen = false;
          // Force un recalcul de l'animation
          this.texteElement.nativeElement.style.animation = 'none';
          setTimeout(() => {
            this.updateScrollSpeed();
          }, 10);
        })
        .catch(console.error);
    }
  }
  public isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isTypeSupported(mimeType: string): boolean {
    return MediaRecorder.isTypeSupported(mimeType);
  }
}
