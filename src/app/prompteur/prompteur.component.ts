import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { VideoService } from '../services/video.service';
import { SessionService } from '../services/session.service';
import { PaymentPopupComponent } from '../payment-popup/payment-popup.component';
declare const VideoRecorder: any;


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
  countdown = 0;
  isFullscreen = false;
  isScrolling = true;
  recordingTime = 0;
  timerInterval: any;
  showPaymentPopup = false;
  private videoBlobUrl: string | null = null;

  constructor(
    private videoService: VideoService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
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
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
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
          video.play().catch(e => console.error('iOS play error:', e));
          document.body.removeEventListener('click', playVideo);
        };
        document.body.addEventListener('click', playVideo, { once: true });
      } else {
        await video.play();
      }

    } catch (err) {
      console.error('Camera error:', err);
      alert('Erreur caméra: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  startRecording() {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
      return;
    }

    if (this.isIOS() && VideoRecorder) {
      console.log("✅ Using iOS native plugin");
      this.recordWithNativeAPI();
    } else if ('MediaRecorder' in window) {
      this.recordWithMediaRecorder();
    } else {
      alert("L'enregistrement vidéo n'est pas supporté sur cet appareil");
    }
  }

  private async recordWithNativeAPI() {
    try {
      const result = await VideoRecorder.recordVideo({
        quality: 'high',
        duration: 0,
        camera: 'front'
      });

      if (result?.path) {
        const video = this.videoElement.nativeElement;
        video.src = result.path;
        video.setAttribute('controls', 'true');
        await video.play();

        const response = await fetch(result.path);
        const blob = await response.blob();
        await this.uploadVideo(blob);
      }
    } catch (err) {
      console.error('Native recording error:', err);
      alert("Erreur d'enregistrement natif: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  private recordWithMediaRecorder() {
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
      console.log('🎬 Initialisation du MediaRecorder...');
  
      this.recordedChunks = [];
  
      this.mediaRecorder = new MediaRecorder(this.stream!);
  
      console.log('✅ MediaRecorder créé avec succès');
      console.log('🎥 MIME type détecté :', this.mediaRecorder.mimeType);
  
      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        console.log('📦 Donnée vidéo disponible - taille :', e.data.size, 'octets');
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
  
      this.mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder arrêté');
        console.log('🧩 Nombre de morceaux enregistrés :', this.recordedChunks.length);
  
        const blob = new Blob(this.recordedChunks); // pas de type forcé
        console.log('🎞️ Blob vidéo généré - taille totale :', blob.size, 'octets');
  
        this.previewRecording(blob);
        this.uploadVideo(blob);
      };
  
      this.mediaRecorder.onerror = (error) => {
        console.error('❌ MediaRecorder a rencontré une erreur :', error);
      };
  
      this.mediaRecorder.start(100);
      console.log('▶️ Enregistrement démarré');
  
      this.startRecordingTimer();
      this.isRecording = true;
      this.scrollTexte();
  
    } catch (err) {
      console.error('🔥 Erreur lors du démarrage de l\'enregistrement :', err);
      alert("Erreur d'enregistrement: " + (err instanceof Error ? err.message : String(err)));
    }
  }
  

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    clearInterval(this.timerInterval);
    this.isRecording = false;
  }

  private startRecordingTimer() {
    this.recordingTime = 0;
    this.timerInterval = setInterval(() => {
      this.recordingTime++;
    }, 1000);
  }

  private async uploadVideo(blob: Blob) {
    try {
      await this.videoService.uploadVideo(blob).toPromise();
      alert('Vidéo enregistrée avec succès!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors de l\'envoi de la vidéo');
    }
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

  isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
