import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAuthenticatedUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}auth/me`);
  }

  updateUserProfile(user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}users/auth/me`, user);
  }


  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}users`);
  }

  subscribe(toUserId: number, subscriberId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}users/${toUserId}/subscribe/${subscriberId}`, {});
  }
  
  unsubscribe(toUserId: number, subscriberId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}users/${toUserId}/unsubscribe/${subscriberId}`, {});
  }
  

}
