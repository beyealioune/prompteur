import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Filesystem } from '@capacitor/filesystem';


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
    return `${environment.apiUrl}videos/download/${fileName}`;
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

async uploadNativeVideo(path: string): Promise<void> {
  try {
    const filePath = path.startsWith('file://') ? path.replace('file://', '') : path;
    const result = await Filesystem.readFile({ path: filePath });

    // Sécurise le type
    if (typeof result.data !== 'string') {
      alert('Erreur : la donnée lue n\'est pas une chaîne base64');
      return;
    }

    // Convertit le base64 en Uint8Array puis en Blob
    const byteCharacters = atob(result.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'video/mp4' });

    // Envoie sur ton backend
    this.uploadVideo(blob, '.mp4').subscribe({
      next: () => alert('Vidéo native envoyée !'),
      error: (err) => alert('Erreur upload native: ' + err.message)
    });
  } catch (err: any) {
    alert('Erreur lecture ou upload vidéo native: ' + (err.message || err));
  }


}
}