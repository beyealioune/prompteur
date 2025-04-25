import { Component, ElementRef, OnInit } from '@angular/core';
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
  imports: [CommonModule, MatCardModule,
    MatButtonModule, MatFormFieldModule,
    MatInputModule,],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.css'
})
export class VideoListComponent implements OnInit {
  videos: any[] = [];
  videoUrls: { [key: string]: SafeResourceUrl } = {};


  constructor(public videoService: VideoService, private sanitizer: DomSanitizer) {}
// Ajoutez ViewChild si vous utilisez la référence template
@ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

// Modifiez la méthode setupVideoForIOS pour gérer les erreurs
public setupVideoForIOS(videoElement: HTMLVideoElement): void {
  if (!videoElement) return;
  
  if (this.isIOS()) {
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.muted = true;
    
    // Tentative de lecture automatique avec gestion d'erreur
    videoElement.play().catch(e => {
      console.log('Autoplay prevented:', e);
      // Afficher un bouton play manuel si nécessaire
    });
  }
}
// Modifiez ngOnInit pour initialiser les vidéos
ngOnInit(): void {
  this.videoService.getAllVideos().subscribe(videos => {
    this.videos = videos;
    
    videos.forEach(video => {
      const url = this.videoService.streamVideoUrl(video.fileName);
      // Pour iOS, forcez le téléchargement si le format n'est pas supporté
      if (this.isIOS() && !video.fileName.toLowerCase().endsWith('.mp4')) {
        console.warn('Format vidéo potentiellement non supporté sur iOS');
      }
      this.videoUrls[video.fileName] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  });
}
  

// Modifiez la méthode getSafeUrl dans VideoListComponent
getSafeUrl(fileName: string): SafeResourceUrl {
  const url = this.videoService.streamVideoUrl(fileName);
  // Pour iOS, ajoutez des paramètres spécifiques
  if (this.isIOS()) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${url}#t=0.1`);
  }
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

// Ajoutez cette méthode pour détecter iOS
public isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
download(fileName: string): void {
  if (this.isIOS()) {
    // Pour iOS, utilisez directement l'URL de téléchargement
    const downloadUrl = this.videoService.downloadVideoUrl(fileName);
    window.open(downloadUrl, '_blank');
    return;
  }

  // Approche standard pour les autres plateformes
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
    }, 100);
  });
}
}

function ViewChild(arg0: string): (target: VideoListComponent, propertyKey: "videoPlayer") => void {
  throw new Error('Function not implemented.');
}
