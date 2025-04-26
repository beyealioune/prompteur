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
      const blob = await this.videoService.downloadVideo(fileName).toPromise();

      if (!blob) {
        console.error('Blob undefined, téléchargement échoué');
        alert('Le téléchargement a échoué. Veuillez réessayer.');
        return;
      }

      if (this.isIOS() || this.isAndroid()) {
        await this.downloadForMobile(blob, fileName);
      } else {
        this.downloadForDesktop(blob, fileName);
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

    setTimeout(() => {
      a.dispatchEvent(new MouseEvent('click'));
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  private async downloadForMobile(blob: Blob, fileName: string): Promise<void> {
    if (typeof (window as any).cordova !== 'undefined') {
      // Cas spécifique si tu utilises Cordova/Capacitor
      const filePath = (window as any).cordova.file.externalRootDirectory + fileName;
      const fileEntry = await (window as any).resolveLocalFileSystemURL(filePath);

      fileEntry.createWriter(async (fileWriter: any) => {
        fileWriter.onwriteend = () => {
          alert('Téléchargement terminé! Fichier enregistré dans: ' + filePath);
        };

        fileWriter.onerror = (e: any) => {
          console.error('Erreur d\'écriture:', e);
          alert('Erreur lors de l\'enregistrement du fichier');
        };

        await fileWriter.write(blob);
      });
    } else {
      // Pour navigateur mobile
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);

      setTimeout(() => {
        a.dispatchEvent(new MouseEvent('click'));
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
