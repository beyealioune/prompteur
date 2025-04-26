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


async download(fileName: string): Promise<void> {
  try {
    const blob = await this.videoService.downloadVideo(fileName).toPromise();
    
    if (this.isIOS() || this.isAndroid()) {
      // Méthode spécifique pour mobile
      if (blob) {
        await this.downloadForMobile(blob, fileName);
      } else {
        console.error('Blob is undefined. Cannot proceed with download.');
        alert('Le téléchargement a échoué. Veuillez réessayer.');
      }
    } else {
      // Méthode standard pour desktop
      if (blob) {
        this.downloadForDesktop(blob, fileName);
      } else {
        console.error('Blob is undefined. Cannot proceed with download.');
        alert('Le téléchargement a échoué. Veuillez réessayer.');
      }
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    alert('Le téléchargement a échoué. Veuillez réessayer.');
  }
}

private downloadForDesktop(blob: Blob, fileName: string): void {
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
}

private async downloadForMobile(blob: Blob, fileName: string): Promise<void> {
  if (typeof (window as any).cordova !== 'undefined') {
    // Solution pour Cordova/PhoneGap/Capacitor
    const filePath = (window as any).cordova.file.externalRootDirectory + fileName;
    const fileEntry = await (window as any).resolveLocalFileSystemURL(filePath);
    
    fileEntry.createWriter(async (fileWriter: { onwriteend: () => void; onerror: (e: any) => void; write: (arg0: Blob) => any; }) => {
      fileWriter.onwriteend = () => {
        alert('Téléchargement terminé! Fichier enregistré dans: ' + filePath);
      };
      
      fileWriter.onerror = (e) => {
        console.error('Erreur d\'écriture:', e);
        alert('Erreur lors de l\'enregistrement du fichier');
      };
      
      await fileWriter.write(blob);
    });
  } else {
    // Solution pour les navigateurs mobiles
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Nécessaire pour iOS
    document.body.appendChild(a);
    a.click();
    
    // Petite temporisation pour iOS
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
  }
}

isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}
}

