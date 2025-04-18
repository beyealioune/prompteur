import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private pathService = environment.apiUrl + 'videos';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  // ✅ utilisé uniquement pour téléchargement local (download)
  getStreamBlob(fileName: string): Observable<SafeResourceUrl> {
    return this.http.get(`${this.pathService}/stream/${fileName}`, { responseType: 'blob' }).pipe(
      map((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      })
    );
  }

  // ✅ utilisé pour charger les vidéos directement depuis l’URL HTTP
  streamVideoUrl(fileName: string): string {
    return `${this.pathService}/stream/${fileName}`;
  }

  uploadVideo(blob: Blob): Observable<string> {
    const formData = new FormData();
    const file = new File([blob], 'video.webm', { type: 'video/webm' });
    formData.append('file', file);
    return this.http.post(`${this.pathService}/upload`, formData, { responseType: 'text' });
  }

  getAllVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.pathService}/all`);
  }

  downloadVideo(fileName: string): Observable<Blob> {
    return this.http.get(`${this.pathService}/download/${fileName}`, { responseType: 'blob' });
  }
}
