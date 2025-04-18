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
  styleUrl: './prompteur.component.css'
})
export class PrompteurComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('texteElement') texteElement!: ElementRef<HTMLDivElement>;

  texte = `Bienvenue sur notre application prompteur.`;
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
        video: { facingMode: 'user' },
        audio: true
      });

      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      video.classList.add('mirror');

      await video.play();
    } catch (err) {
      alert("Erreur lors de l'accès à la caméra : " + (err instanceof Error ? err.message : String(err)));
    }
  }

  startRecording() {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
      return;
    }

    if (this.isIOS() && typeof VideoRecorder !== 'undefined') {
      this.recordWithNativeAPI();
    } else if ('MediaRecorder' in window) {
      this.recordWithMediaRecorder();
    } else {
      alert("L'enregistrement vidéo n'est pas supporté sur cet appareil");
    }
  }

  private async recordWithNativeAPI() {
    try {
      const result = await VideoRecorder.recordVideo({ quality: 'high', duration: 0, camera: 'front' });
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
      alert("Erreur d'enregistrement natif : " + (err instanceof Error ? err.message : String(err)));
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
    const supportedTypes = [
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    let mimeType = '';
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    if (!mimeType) {
      alert("Aucun format vidéo supporté");
      return;
    }

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream!, { mimeType });

    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      this.previewRecording(blob);
      this.uploadVideo(blob);
    };

    this.mediaRecorder.start(100);
    this.startRecordingTimer();
    this.isRecording = true;
    this.scrollTexte();
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
    this.timerInterval = setInterval(() => this.recordingTime++, 1000);
  }

  private async uploadVideo(blob: Blob) {
    try {
      await this.videoService.uploadVideo(blob).toPromise();
      alert('Vidéo envoyée avec succès !');
    } catch (err) {
      alert("Erreur d'envoi de la vidéo");
    }
  }

  private previewRecording(blob: Blob) {
    if (this.videoBlobUrl) URL.revokeObjectURL(this.videoBlobUrl);
    this.videoBlobUrl = URL.createObjectURL(blob);
    const video = this.videoElement.nativeElement;
    video.srcObject = null;
    video.src = this.videoBlobUrl;
    video.setAttribute('controls', 'true');
    video.play().catch(e => console.error('Erreur lecture :', e));
  }

  scrollTexte() {
    this.isScrolling = false;
    setTimeout(() => this.isScrolling = true, 10);
  }

  isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
