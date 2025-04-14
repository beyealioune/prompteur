import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit
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
export class PrompteurComponent implements AfterViewInit, OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('texteElement') texteElement!: ElementRef;

  texte: string = `Bienvenue sur notre application prompteur.`;
  isRecording: boolean = false;
  mediaRecorder: any;
  recordedChunks: any[] = [];
  stream: any;
  vitesse: number = 20;
  countdown: number = 0;
  isFullscreen = false;

  recordingTime = 0;
  timerInterval: any;
  showPaymentPopup = false;
  isScrolling = true;

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

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track: any) => {
        track.stop();
      });
      this.stream = null;
    }
  }

  async startCamera() {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
      return;
    }

    this.stopCamera();

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: true
    });

    this.videoElement.nativeElement.srcObject = this.stream;
    this.videoElement.nativeElement.muted = true;
    this.videoElement.nativeElement.play();
  }

  startRecording() {
    if (!this.sessionService.hasAccess()) {
      this.showPaymentPopup = true;
      return;
    }

    if (!this.stream || this.stream.getVideoTracks().length === 0) {
      alert('La caméra n’est pas active. Veuillez la démarrer.');
      return;
    }

    this.countdown = 3;

    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        clearInterval(interval);

        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (e: any) => {
          if (e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

          this.videoElement.nativeElement.srcObject = null;
          this.videoElement.nativeElement.src = URL.createObjectURL(blob);
          this.videoElement.nativeElement.controls = true;
          this.videoElement.nativeElement.play();

          this.videoService.uploadVideo(blob).subscribe({
            next: (message) => alert('Upload réussi : ' + message),
            error: (err) => alert('Erreur upload : ' + err.message),
          });
        };

        this.mediaRecorder.start();
        this.recordingTime = 0;
        this.timerInterval = setInterval(() => {
          this.recordingTime++;
        }, 1000);

        this.isRecording = true;
        this.scrollTexte();
      }
    }, 1000);
  }

  stopRecording() {
    clearInterval(this.timerInterval);
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    this.isRecording = false;
  }

  toggleFullscreen(): void {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;

      setTimeout(() => {
        this.startCamera();
      }, 500);
    }
  }

  scrollTexte() {
    this.isScrolling = false;
    setTimeout(() => {
      this.isScrolling = true;
    }, 10);
  }
}
