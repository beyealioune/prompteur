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
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      if (this.isIOS()) {
        const playVideo = () => {
          video.play().catch(e => console.error('Play error:', e));
          document.body.removeEventListener('click', playVideo);
        };
        document.body.addEventListener('click', playVideo, { once: true });
      } else {
        await video.play();
      }

    } catch (err) {
      console.error('Camera error:', err);
      alert(`Erreur caméra: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public isIOS(): boolean {
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

    if (!('MediaRecorder' in window)) {
      alert('MediaRecorder non supporté sur cet appareil. Veuillez utiliser Android ou une version compatible.');
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
      console.log("🎥 Démarrage MediaRecorder");

      if (!this.stream || this.stream.getTracks().length === 0) {
        throw new Error("❌ Aucun flux vidéo disponible");
      }

      if (typeof MediaRecorder === 'undefined') {
        throw new Error("❌ MediaRecorder non défini dans ce navigateur");
      }

      if (!MediaRecorder.isTypeSupported('video/webm')) {
        console.warn("⚠️ Format video/webm non supporté");
      }

      try {
        this.mediaRecorder = new MediaRecorder(this.stream);
      } catch (mediaErr) {
        console.error("❌ Échec MediaRecorder :", mediaErr);
        alert("Erreur MediaRecorder : " + (mediaErr instanceof Error ? mediaErr.message : mediaErr));
        return;
      }

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        console.log("📦 Chunk reçu", e.data);
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log("✅ Enregistrement terminé.");
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.previewRecording(blob);
        this.uploadVideo(blob);
      };

      this.mediaRecorder.start(100);
      this.startRecordingTimer();
      this.isRecording = true;
      this.scrollTexte();

    } catch (err) {
      console.error('❌ Erreur MediaRecorder :', err);
      alert('Erreur MediaRecorder : ' + (err instanceof Error ? err.message : err));
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
      next: () => alert('🎉 Enregistrement envoyé avec succès !'),
      error: (err) => alert('Erreur lors de l\'envoi : ' + err.message)
    });
  }

  toggleFullscreen(): void {
    const videoContainer = this.videoElement.nativeElement.parentElement;

    if (!document.fullscreenElement) {
      videoContainer?.requestFullscreen()
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
