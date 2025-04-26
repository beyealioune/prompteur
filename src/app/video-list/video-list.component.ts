import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService } from '../services/video.service';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.css'
})
export class VideoListComponent implements OnInit {
  videos: any[] = [];
  videoUrls: { [key: string]: SafeResourceUrl } = {};

  constructor(public videoService: VideoService, private sanitizer: DomSanitizer) {}

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  ngOnInit(): void {
    this.videoService.getAllVideos().subscribe(videos => {
      this.videos = videos;
      videos.forEach(video => {
        const url = this.videoService.streamVideoUrl(video.fileName);

        if (this.isIOS() && !video.fileName.toLowerCase().endsWith('.mp4')) {
          console.warn('Format vidéo potentiellement non supporté sur iOS');
        }

        this.videoUrls[video.fileName] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      });
    });
  }

  public setupVideoForIOS(videoElement: HTMLVideoElement): void {
    if (!videoElement) return;

    if (this.isIOS()) {
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('webkit-playsinline', 'true');
      videoElement.muted = true;

      videoElement.play().catch(e => {
        console.log('Lecture automatique bloquée sur iOS:', e);
        // ici tu peux afficher un bouton "Play" manuel si besoin
      });
    }
  }

  getSafeUrl(fileName: string): SafeResourceUrl {
    const url = this.videoService.streamVideoUrl(fileName);
    if (this.isIOS()) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`${url}#t=0.1`);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  
  
  private async downloadForIOS(blob: Blob): Promise<void> {
    // Solution 1: Utilisation de FileReader + window.open
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newWindow = window.open('', '_blank');
      
      if (newWindow) {
        newWindow.location.href = dataUrl;
      } else {
        // Fallback si popup bloquée
        const link = document.createElement('a');
        link.href = dataUrl;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 1000);
      }
    };
    
    reader.readAsDataURL(blob);
  
    // Solution alternative avec création d'iframe
    await new Promise(resolve => setTimeout(resolve, 1000));
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = URL.createObjectURL(blob);
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 5000);
  }
  
  private downloadForOtherPlatforms(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
  }
  
  private showDownloadError(fileName: string): void {
    // Solution de dernier recours
    const confirmDownload = confirm('Le téléchargement automatique a échoué. Voulez-vous ouvrir la vidéo dans un nouvel onglet ?');
    if (confirmDownload) {
      window.open(this.videoService.downloadVideoUrl(fileName), '_blank');
    }
  }
  private async downloadForMobile(blob: Blob, fileName: string): Promise<void> {
    // Solution universelle pour mobile (sans Cordova)
    const url = URL.createObjectURL(blob);
    
    // Créer un lien temporaire
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Nécessaire pour iOS
    document.body.appendChild(a);
    
    // Simuler le clic
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    a.dispatchEvent(clickEvent);
    
    // Nettoyage
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
    
    // Alternative pour iOS si le téléchargement ne démarre pas
    if (this.isIOS()) {
      const reader = new FileReader();
      reader.onload = () => {
        const safariUrl = reader.result as string;
        window.open(safariUrl, '_blank');
      };
      reader.readAsDataURL(blob);
    }
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  download(fileName: string): void {
    const downloadUrl = this.videoService.downloadVideoUrl(fileName);
  
    if (this.isIOS()) {
      // Pour iOS ➔ Ouvre directement le lien vers l'API (pas de Blob !)
      window.open(downloadUrl, '_blank');
      return;
    }
  
    // Pour Android ou Desktop ➔ Télécharger via Blob
    this.videoService.downloadVideo(fileName).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 200);
    });
  }
  
}
