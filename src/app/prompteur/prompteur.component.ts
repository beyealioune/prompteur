import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { VideoService } from '../services/video.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

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
  ],
  templateUrl: './prompteur.component.html',
  styleUrl: './prompteur.component.css',
})
export class PrompteurComponent implements AfterViewInit {
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

  isScrolling = true;

  constructor(private videoService: VideoService) {}

  ngAfterViewInit() {
    this.scrollTexte(); // ✅ lance le scroll dès l’affichage du composant
  }

  async startCamera() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.videoElement.nativeElement.srcObject = this.stream;
  }

  startRecording() {
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
          this.videoService.uploadVideo(blob).subscribe({
            next: (message) => alert('Upload réussi : ' + message),
            error: (err) => alert('Erreur upload : ' + err.message),
          });

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'enregistrement.webm';
          a.click();
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
    this.mediaRecorder.stop();
    this.isRecording = false;
    // ⛔️ ne pas stopper l’animation ici, car on veut qu'elle continue
  }

  toggleFullscreen(): void {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  scrollTexte() {
    this.isScrolling = false;
    setTimeout(() => {
      this.isScrolling = true;
    }, 10);
  }
}
