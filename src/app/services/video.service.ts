import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  uploadVideo(blob: Blob, fileExtension: string = '.webm'): Observable<string> {
    const formData = new FormData();
    const fileName = `video${fileExtension}`;
    const mimeType = fileExtension === '.mp4' ? 'video/mp4' : 'video/webm';
    
    const file = new File([blob], fileName, { type: mimeType });
    formData.append('file', file);
    
    return this.http.post(`${this.pathService}/upload`, formData, { responseType: 'text' });
  }

  getAllVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.pathService}/all`);
  }

  // Dans votre VideoService
  downloadVideoUrl(fileName: string): string {
    return `${environment.apiUrl}/api/videos/download/${fileName}`;
  }



downloadVideo(fileName: string): Observable<Blob> {
  return this.http.get(`${this.pathService}/download/${fileName}`, {
    responseType: 'blob',
    headers: new HttpHeaders({
      // Important pour iOS
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })
  });
}
}