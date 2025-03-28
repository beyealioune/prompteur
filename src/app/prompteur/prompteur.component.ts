import { Component, ElementRef, ViewChild } from '@angular/core';
import { VideoService } from '../services/video.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-prompteur',
  standalone: true,
  imports: [FormsModule,    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,MatIconModule],
  templateUrl: './prompteur.component.html',
  styleUrl: './prompteur.component.css'
})
export class PrompteurComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('texteElement') texteElement!: ElementRef;

  texte: string = `Bienvenue sur notre application prompteur.`;
  isRecording: boolean = false;
  mediaRecorder: any;
  recordedChunks: any[] = [];
  stream: any;
  vitesse: number = 20;
  countdown: number = 0;

  constructor(private videoService: VideoService) {}

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
  
        // ✅ Lancer l'enregistrement ici
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
            error: (err) => alert('Erreur upload : ' + err.message)
          });
  
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'enregistrement.webm';
          a.click();
        };
  
        this.mediaRecorder.start();
        this.isRecording = true;
        this.scrollTexte();
      }
    }, 1000);
  }
  
  
  toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  stopRecording() {
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  scrollTexte() {
    const texte = this.texteElement.nativeElement;
    texte.style.animation = `scroll-up ${this.vitesse}s linear infinite`;
  }
  
}