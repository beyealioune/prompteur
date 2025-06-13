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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-prompteur',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
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
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  texte: string = `Bienvenue sur notre application prompteur.`;
  isRecording = false;
  cameraOn = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  stream: MediaStream | null = null;
  vitesse: number = 20;
  countdown = 0;
  isFullscreen = false;
  recordingTime = 0;
  timerInterval: any;
  showPaymentPopup = false;
  showSuccessPopup = false;
  showPaywall = false;
  isScrolling = true;
  private videoBlobUrl: string | null = null;
  ref: any;

  constructor(
    private videoService: VideoService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
    }
  }

  private refreshUserStatus() {
    this.sessionService.refreshUser().subscribe((user) => {
      if (user.isPremium || (user.trialEnd && new Date(user.trialEnd) > new Date())) {
        if (this.showPaymentPopup) {
          this.showPaymentPopup = false;
          this.showSuccessPopup = true;
        }
      }
    }, (error) => {
      console.error('Erreur lors du rafraîchissement utilisateur', error);
    });
  }

  closeSuccessPopup() {
    this.showSuccessPopup = false;
  }

  ngAfterViewInit(): void {
    this.updateScrollSpeed();
    this.restartScrolling();
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

  restartScrolling() {
    if (this.texteElement) {
      const el = this.texteElement.nativeElement;
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    }
  }

  increaseSpeed() {
    this.vitesse = Math.max(5, this.vitesse - 5);
    this.updateScrollSpeed();
    this.restartScrolling();
  }

  decreaseSpeed() {
    this.vitesse += 5;
    this.updateScrollSpeed();
    this.restartScrolling();
  }

  // iOS input natif
  openNativeVideoPicker() {
    this.videoInput.nativeElement.value = '';
    this.videoInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.previewRecording(file);
      this.uploadVideo(file);

      this.updateScrollSpeed();
      this.restartScrolling();

      this.snackBar.open('Vidéo chargée !', '', { duration: 2000 });
    }
  }

  async startCamera() {
    if (this.isIOS()) return;
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
      this.cameraOn = true;
      this.isScrolling = true;
      this.updateScrollSpeed();
      this.restartScrolling();
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
    this.cameraOn = false;
    const video = this.videoElement.nativeElement;
    video.srcObject = null;
    video.src = '';
  }

  startRecording() {
    if (!this.cameraOn || !this.stream) {
      alert('Veuillez d\'abord démarrer la caméra');
      return;
    }
    const preferredMimeType = 'video/webm';
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
        mimeType: 'video/webm',
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
          type: this.mediaRecorder?.mimeType || 'video/webm'
        });
        this.previewRecording(blob);
        this.uploadVideo(blob);
      };
      this.mediaRecorder.start(100);
      this.startRecordingTimer();
      this.isRecording = true;
      this.isScrolling = true;
      this.updateScrollSpeed();
      this.restartScrolling();
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
    this.cameraOn = false;
  }

  private uploadVideo(blob: Blob) {
    const extension = blob.type.includes('mp4') ? '.mp4' : '.webm';
    this.videoService.uploadVideo(blob, extension).subscribe({
      next: () => this.snackBar.open('Vidéo envoyée avec succès!', '', { duration: 2000 }),
      error: (err) => this.snackBar.open('Erreur d\'upload: ' + err.message, '', { duration: 3000 }),
    });
  }

  toggleFullscreen(): void {
    const videoContainer = this.videoElement.nativeElement.parentElement;
    if (!document.fullscreenElement) {
      videoContainer?.requestFullscreen()
        .then(() => {
          this.isFullscreen = true;
          this.updateScrollSpeed();
          this.restartScrolling();
        })
        .catch(console.error);
    } else {
      document.exitFullscreen()
        .then(() => {
          this.isFullscreen = false;
          this.updateScrollSpeed();
          this.restartScrolling();
        })
        .catch(console.error);
    }
  }

  public isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  openPaywall() {
    this.showPaymentPopup = true;
    this.ref?.detectChanges?.();
  }

  isTypeSupported(mimeType: string): boolean {
    return MediaRecorder.isTypeSupported(mimeType);
  }
}
