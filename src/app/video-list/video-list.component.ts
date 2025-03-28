import { Component, OnInit } from '@angular/core';
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

  constructor(private videoService: VideoService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.videoService.getAllVideos().subscribe(data => this.videos = data);
  }

  getSafeUrl(fileName: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoService.streamVideoUrl(fileName));
  }

  download(fileName: string): void {
    this.videoService.downloadVideo(fileName).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    });
  }
}
