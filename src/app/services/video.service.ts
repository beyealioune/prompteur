import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class VideoService {
  private baseUrl = 'http://localhost:8080/api/videos';

  constructor(private http: HttpClient) {}

  uploadVideo(blob: Blob): Observable<string> {
    const formData = new FormData();
    const file = new File([blob], 'video.webm', { type: 'video/webm' });
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload`, formData, { responseType: 'text' });
  }

  getAllVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  downloadVideo(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${fileName}`, { responseType: 'blob' });
  }

  streamVideoUrl(fileName: string): string {
    return `${this.baseUrl}/stream/${fileName}`;
  }
}

