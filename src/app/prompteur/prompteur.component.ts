// import {
//   Component,
//   ElementRef,
//   ViewChild,
//   AfterViewInit,
//   OnInit,
//   OnDestroy
// } from '@angular/core';
// import { VideoService } from '../services/video.service';
// import { FormsModule } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { PaymentPopupComponent } from "../payment-popup/payment-popup.component";
// import { SessionService } from '../services/session.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-prompteur',
//   standalone: true,
//   imports: [
//     FormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatCardModule,
//     MatIconModule,
//     CommonModule,
//     PaymentPopupComponent
//   ],
//   templateUrl: './prompteur.component.html',
//   styleUrl: './prompteur.component.css',
// })
// export class PrompteurComponent implements AfterViewInit, OnInit, OnDestroy {
//   @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
//   @ViewChild('texteElement') texteElement!: ElementRef<HTMLDivElement>;

//   texte: string = `Bienvenue sur notre application prompteur.`;
//   isRecording: boolean = false;
//   mediaRecorder: MediaRecorder | null = null;
//   recordedChunks: Blob[] = [];
//   stream: MediaStream | null = null;
//   vitesse: number = 20;
//   countdown: number = 0;
//   isFullscreen = false;
//   recordingTime = 0;
//   timerInterval: any;
//   showPaymentPopup = false;
//   isScrolling = true;
//   private videoBlobUrl: string | null = null;
//   private userSub?: Subscription;
//   isLiveCamera = true;

//   constructor(
//     private videoService: VideoService,
//     private sessionService: SessionService
//   ) {}

//   ngOnInit(): void {
//     this.userSub = this.sessionService.$user.subscribe(user => {
//       this.showPaymentPopup = !this.sessionService.hasAccess();
//     });

//     // Facultatif si tu veux auto-refresh au premier lancement
//     if (!this.sessionService.user) {
//       this.sessionService.refreshUser().subscribe();
//     }
//   }

//   ngAfterViewInit() {
//     this.scrollTexte();
//   }

//   ngOnDestroy(): void {
//     this.cleanupResources();
//     this.userSub?.unsubscribe();
//   }


// increaseSpeed() {
//   if (this.vitesse < 60) this.vitesse += 5;
//   this.updateScrollSpeed();
//   this.restartScrolling();
// }

// decreaseSpeed() {
//   if (this.vitesse > 5) this.vitesse -= 5;
//   this.updateScrollSpeed();
//   this.restartScrolling();
// }
// restartScrolling() {
//   // Arrête le scroll puis le relance immédiatement
//   this.isScrolling = false;
//   setTimeout(() => {
//     this.isScrolling = true;
//     this.updateScrollSpeed(); // Pour être sûr d'avoir la bonne vitesse
//   }, 10);
// }

// updateScrollSpeed() {
//   if (this.texteElement) {
//     this.texteElement.nativeElement.style.setProperty('--scroll-speed', `${this.vitesse}s`);
//   }
// }


//   private cleanupResources() {
//     this.stopRecording();
//     this.stopCamera();
//     if (this.videoBlobUrl) {
//       URL.revokeObjectURL(this.videoBlobUrl);
//     }
//   }

//   stopCamera() {
//     if (this.stream) {
//       this.stream.getTracks().forEach(track => track.stop());
//       this.stream = null;
//     }
//     const video = this.videoElement.nativeElement;
//     video.srcObject = null;
//     video.src = '';
//   }

//   async startCamera() {
//     this.isLiveCamera = true;

//     this.stopCamera();

//     try {
//       this.stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: 'user',
//           width: { ideal: 1280 },
//           height: { ideal: 720 }
//         },
//         audio: true // Activation de l'audio pour iOS
//       });

//       const video = this.videoElement.nativeElement;
//       video.srcObject = this.stream;
//       video.muted = true;
//       video.setAttribute('playsinline', 'true');
//       video.setAttribute('webkit-playsinline', 'true');

//       if (this.isIOS()) {
//         // Solution spécifique iOS pour l'autoplay
//         const playVideo = () => {
//           video.play().catch(e => console.error('Play error:', e));
//           document.body.removeEventListener('click', playVideo);
//         };
//         document.body.addEventListener('click', playVideo, { once: true });
//       } else {
//         await video.play();
//       }

//     } catch (err) {
//       console.error('Camera error:', err);
//       alert(`Erreur caméra: ${err instanceof Error ? err.message : String(err)}`);
//     }
//   }

//   public isIOS(): boolean {
//     return /iPad|iPhone|iPod/.test(navigator.userAgent);
//   }

//   isTypeSupported(mimeType: string): boolean {
//     return MediaRecorder.isTypeSupported(mimeType);
//   }

//   startRecording() {
//     if (!this.stream) {
//       alert('Veuillez d\'abord démarrer la caméra');
//       return;
//     }

    // Vérification des formats supportés
  //   const preferredMimeType = this.isIOS() ? 'video/mp4' : 'video/webm';
  //   if (!this.isTypeSupported(preferredMimeType)) {
  //     alert(`Le format ${preferredMimeType} n'est pas supporté sur votre appareil`);
  //     return;
  //   }

  //   this.countdown = 3;

  //   const interval = setInterval(() => {
  //     this.countdown--;
  //     if (this.countdown === 0) {
  //       clearInterval(interval);
  //       this.startMediaRecorder();
  //     }
  //   }, 1000);
  // }

  // private startMediaRecorder() {
  //   try {
  //     this.recordedChunks = [];
      
      // Options pour iOS/Safari
      // const options = {
      //   mimeType: this.isIOS() ? 'video/mp4' : 'video/webm',
      //   videoBitsPerSecond: 2500000
      // };

      // Création du MediaRecorder avec fallback
  //     try {
  //       this.mediaRecorder = new MediaRecorder(this.stream!, options);
  //     } catch (e) {
  //       console.warn('Format préféré non supporté, tentative avec format de base');
  //       this.mediaRecorder = new MediaRecorder(this.stream!);
  //     }

  //     this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
  //       if (e.data.size > 0) {
  //         this.recordedChunks.push(e.data);
  //       }
  //     };

  //     this.mediaRecorder.onstop = () => {
  //       const blob = new Blob(this.recordedChunks, { 
  //         type: this.mediaRecorder?.mimeType || 'video/mp4' 
  //       });
  //       this.previewRecording(blob);
  //       this.uploadVideo(blob);
  //     };

  //     this.mediaRecorder.start(100);
  //     this.startRecordingTimer();
  //     this.isRecording = true;
  //     this.scrollTexte();

  //   } catch (err) {
  //     console.error('Recording error:', err);
  //     alert('Erreur lors du démarrage de l\'enregistrement: ' + (err instanceof Error ? err.message : String(err)));
  //   }
  // }

  // private startRecordingTimer() {
  //   this.recordingTime = 0;
  //   this.timerInterval = setInterval(() => {
  //     this.recordingTime++;
  //   }, 1000);
  // }

  // stopRecording() {
  //   if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
  //     this.mediaRecorder.stop();
  //   }
  //   clearInterval(this.timerInterval);
  //   this.isRecording = false;
  // }

  // private uploadVideo(blob: Blob) {
  //   const fileExtension = blob.type.includes('mp4') ? '.mp4' : '.webm';
  //   this.videoService.uploadVideo(blob, fileExtension).subscribe({
  //     next: () => alert('Enregistrement envoyé avec succès!'),
  //     error: (err) => alert('Erreur lors de l\'envoi: ' + err.message)
  //   });
  // }

  // toggleFullscreen(): void {
  //   const videoContainer = this.videoElement.nativeElement.parentElement;
  
  //   if (!document.fullscreenElement) {
  //     videoContainer?.requestFullscreen()
  //       .then(() => {
  //         this.isFullscreen = true;
  //         // Restart scrolling tout de suite
  //         this.scrollTexte();
  //       })
  //       .catch(console.error);
  //   } else {
  //     document.exitFullscreen()
  //       .then(() => {
  //         this.isFullscreen = false;
  //         this.scrollTexte();
  //       })
  //       .catch(console.error);
  //   }
  // }

  // toggleFullscreen(): void {
  //   const videoContainer = this.videoElement.nativeElement.parentElement;
  
  //   if (!document.fullscreenElement) {
  //     videoContainer?.requestFullscreen()
  //       .then(() => {
  //         this.isFullscreen = true;
  //         // Réinitialiser et relancer immédiatement l'animation
  //         this.resetAndStartScrolling();
  //       })
  //       .catch(console.error);
  //   } else {
  //     document.exitFullscreen()
  //       .then(() => {
  //         this.isFullscreen = false;
  //         this.resetAndStartScrolling();
  //       })
  //       .catch(console.error);
  //   }
  // }

  
  

  // resetAndStartScrolling(): void {
    // Forcer le redémarrage de l'animation
    // this.isScrolling = false;
    // setTimeout(() => {
    //   this.isScrolling = true;
      // Recalculer les styles pour forcer le navigateur à redémarrer l'animation
  //     if (this.texteElement) {
  //       this.texteElement.nativeElement.style.animation = 'none';
  //       this.texteElement.nativeElement.offsetHeight; // Trigger reflow
  //       this.texteElement.nativeElement.style.animation = `scroll-up ${this.vitesse}s linear infinite`;
  //     }
  //   }, 10);
  // }
  // scrollTexte() {
    
  //   this.isScrolling = false;
  //   setTimeout(() => {
  //     this.isScrolling = true;
  //   }, 10);
  // }
//   scrollTexte() {
//     this.resetAndStartScrolling();
//   }

//   private previewRecording(blob: Blob) {
//     this.isLiveCamera = false;

//     if (this.videoBlobUrl) {
//       URL.revokeObjectURL(this.videoBlobUrl);
//     }

//     this.videoBlobUrl = URL.createObjectURL(blob);
//     const video = this.videoElement.nativeElement;

//     video.srcObject = null;
//     video.src = this.videoBlobUrl;
//     video.setAttribute('controls', 'true');

//     video.play().catch(e => console.error('Playback error:', e));
//   }
// } 

import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
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
import { Subscription } from 'rxjs';
import { PaymentService } from '../services/payment.service';

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
  @ViewChild('texteWrapper') texteWrapper!: ElementRef<HTMLDivElement>;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('texteElement') texteElement!: ElementRef<HTMLDivElement>;

  texte: string = `  Welcome to our teleprompter app..`;
  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  stream: MediaStream | null = null;
  vitesse: number = 20;
  countdown: number = 0;
  isFakeFullscreen = false;
  recordingTime = 0;
  timerInterval: any;
  showPaymentPopup = false;
  private videoBlobUrl: string | null = null;
  private userSub?: Subscription;
  isLiveCamera = true;
  isVideoVisible = true;
  isAllowed = false;

  constructor(
    private videoService: VideoService,
    private sessionService: SessionService,
    private paymentService: PaymentService,

    private cdr: ChangeDetectorRef

  ) {}

  async ngOnInit(): Promise<void> {
    this.isAllowed = await this.paymentService.checkPremium();

    this.userSub = this.sessionService.$user.subscribe(user => {
      this.showPaymentPopup = !this.sessionService.hasAccess();
    });
    if (!this.sessionService.user) {
      this.sessionService.refreshUser().subscribe();
    }
  }

  ngAfterViewInit() {
    this.updateScrollSpeed();
  }

  ngOnDestroy(): void {
    this.cleanupResources();
    this.userSub?.unsubscribe();
  }

  increaseSpeed() {
    if (this.vitesse < 60) this.vitesse += 5;
    this.updateScrollSpeed();
  }

  decreaseSpeed() {
    if (this.vitesse > 5) this.vitesse -= 5;
    this.updateScrollSpeed();
  }

updateScrollSpeed() {
  const wrapper = this.texteWrapper?.nativeElement;
  if (wrapper) {
    wrapper.style.setProperty('--scroll-speed', `${this.vitesse}s`);
    // Pour forcer le restart de l’anim lors d’un changement de texte ou plein écran
    wrapper.style.animation = 'none';
    // Trigger un reflow (force le navigateur à recalculer)
    // @ts-ignore
    void wrapper.offsetWidth;
    wrapper.style.animation = `scroll-up-continuous ${this.vitesse}s linear infinite`;
  }
}


  onTexteChange() {
    this.updateScrollSpeed();
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
    this.isAllowed = await this.paymentService.checkPremium();
    const backendHasAccess = this.sessionService.hasAccess(); // utilise ta méthode existante !

    if (!this.isAllowed || !backendHasAccess) {
      this.showPaymentPopup = true;
      return;
    }
    this.isLiveCamera = true;
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

  isTypeSupported(mimeType: string): boolean {
    return MediaRecorder.isTypeSupported(mimeType);
  }

  startRecording() {
    if (!this.isAllowed) {
      this.showPaymentPopup = true;
      return;
    }
    if (!this.stream) {
      alert('Veuillez d\'abord démarrer la caméra');
      return;
    }
    const preferredMimeType = this.isIOS() ? 'video/mp4' : 'video/webm';
    if (!this.isTypeSupported(preferredMimeType)) {
      alert(`Le format ${preferredMimeType} n'est pas supporté sur votre appareil`);
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
      } catch (e) {
        console.warn('Format préféré non supporté, tentative avec format de base');
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
    } catch (err) {
      console.error('Recording error:', err);
      alert('Erreur lors du démarrage de l\'enregistrement: ' + (err instanceof Error ? err.message : String(err)));
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
    const fileExtension = blob.type.includes('mp4') ? '.mp4' : '.webm';
    this.videoService.uploadVideo(blob, fileExtension).subscribe({
      next: () => alert('Enregistrement envoyé avec succès!'),
      error: (err) => alert('Erreur lors de l\'envoi: ' + err.message)
    });
  }

  // === FAKE FULLSCREEN ===
  // toggleFakeFullscreen(): void {
  //   this.isFakeFullscreen = !this.isFakeFullscreen;
  //   if (this.isFakeFullscreen) {
  //     document.body.classList.add('fake-fullscreen-active');
  //   } else {
  //     document.body.classList.remove('fake-fullscreen-active');
  //   }
  // }

  toggleFakeFullscreen(): void {
    this.isFakeFullscreen = !this.isFakeFullscreen;
    if (!this.isFakeFullscreen) {
      // On cache la vidéo puis on la réaffiche pour forcer le recalcul du layout
      this.isVideoVisible = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isVideoVisible = true;
        this.cdr.detectChanges();
      }, 30);
    } else {
      document.body.classList.add('fake-fullscreen-active');
    }
    if (!this.isFakeFullscreen) {
      document.body.classList.remove('fake-fullscreen-active');
    }
  }

  private previewRecording(blob: Blob) {
    this.isLiveCamera = false;
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
