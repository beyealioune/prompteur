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
  async download(fileName: string): Promise<void> {
    try {
      // 1. Récupérer le blob
      const blob = await this.videoService.downloadVideo(fileName).toPromise();
      
      if (!blob) {
        throw new Error('Le fichier à télécharger est vide');
      }
  
      // 2. Créer un URL objet
      const blobUrl = URL.createObjectURL(blob);
      
      // 3. Créer un lien invisible
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = fileName;
      
      // 4. Ajouter au DOM et cliquer
      document.body.appendChild(a);
      a.click();
      
      // 5. Nettoyer après un délai
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        
        // Solution alternative pour iOS si le téléchargement ne démarre pas
        if (this.isIOS() && !navigator.userAgent.includes('Safari')) {
          window.open(this.videoService.downloadVideoUrl(fileName), '_blank');
        }
      }, 200);
      
    } catch (error) {
      console.error('Échec du téléchargement:', error);
      alert('Impossible de télécharger le fichier. Essayez avec un autre navigateur.');
      
      // Fallback ultime - ouvrir dans un nouvel onglet
      window.open(this.videoService.downloadVideoUrl(fileName), '_blank');
    }
  }
  private downloadForDesktop(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);

    setTimeout(() => {
      a.dispatchEvent(new MouseEvent('click'));
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
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
}
