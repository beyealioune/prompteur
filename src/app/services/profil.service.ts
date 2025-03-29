import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {

  private baseUrl = environment.baseUrl;
  

  constructor(private http: HttpClient) { }


  updateProfile(user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/users/auth/me`, user);
  }

  updatePassword(password: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/users/auth/password`, { password });
  }

  uploadPhoto(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/api/users/${userId}/upload-photo`, formData);
  }
}
