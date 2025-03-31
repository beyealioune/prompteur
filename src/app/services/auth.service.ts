import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../models/registerRequest';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/loginRequest';
import { environment } from '../environments/environment';
import { AuthSuccess } from '../models/authSuccess';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private pathService = environment.baseUrl + 'auth';

  constructor(private httpClient: HttpClient) { }

  public register(registerRequest: RegisterRequest): Observable<AuthSuccess> {
    return this.httpClient.post<AuthSuccess>(`${this.pathService}/register`, registerRequest);
  }

  public login(loginRequest: LoginRequest): Observable<AuthSuccess> {
    return this.httpClient.post<AuthSuccess>(`${this.pathService}/login`, loginRequest);
  }

 public me(): Observable<any> {
  return this.httpClient.get<any>("http://localhost:8080/api/auth/me");
}

forgotPassword(email: string) {
  console.log("ok");
  
  return this.httpClient.post('http://localhost:8080/api/auth/forgot-password', { email });
}

resetPassword(token: string, password: string) {
  return this.httpClient.post('http://localhost:8080/api/auth/reset-password', {
    token,
    password
  });
}


}
