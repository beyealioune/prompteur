// src/app/video-list/video-list.component.ts
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
        this.videoUrls[video.fileName] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      });
    });
  }

  getSafeUrl(fileName: string): SafeResourceUrl {
    const url = this.videoService.streamVideoUrl(fileName);
    if (this.isIOS()) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`${url}#t=0.1`);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
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
