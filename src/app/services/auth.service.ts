import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../models/registerRequest';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/loginRequest';
import { AuthSuccess } from '../models/authSuccess';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private pathService = environment.apiUrl + 'auth'; // Ajoute le /api ici

  constructor(private httpClient: HttpClient) { }

  public register(registerRequest: RegisterRequest): Observable<AuthSuccess> {
    return this.httpClient.post<AuthSuccess>(`${this.pathService}/register`, registerRequest).pipe(
      tap((res: AuthSuccess) => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  public login(loginRequest: LoginRequest): Observable<AuthSuccess> {
    
    return this.httpClient.post<AuthSuccess>(`${this.pathService}/login`, loginRequest).pipe(
      tap((res: AuthSuccess) => {
        localStorage.setItem('token', res.token);
        console.log("token : ", res.token);

      })
    );
  }

  public me(): Observable<any> {
    return this.httpClient.get<any>(`${this.pathService}/me`);
  }

  forgotPassword(email: string) {
    return this.httpClient.post(`${this.pathService}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.httpClient.post(`${this.pathService}/reset-password`, {
      token,
      password
    });
  }
}
