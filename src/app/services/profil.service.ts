import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {

  private baseUrl = environment.apiUrl;
  

  constructor(private http: HttpClient) { }


  updateProfile(user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}users/auth/me`, user);
  }

  updatePassword(password: string): Observable<any> {
    return this.http.put(`${this.baseUrl}users/auth/password`, { password });
  }
  deleteAccount(userId: number) {
    return this.http.delete(`${environment.apiUrl}user/${userId}`);
  }
  
  uploadPhoto(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}users/${userId}/upload-photo`, formData);
  }

  cancelSubscription(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}users/cancel`, {});
  }
  
  
}
