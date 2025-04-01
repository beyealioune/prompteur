import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PingService {
  constructor(private http: HttpClient) {}

  ping() {
    return this.http.get(`${environment.apiUrl}/ping`, { responseType: 'text' });
  }
}
