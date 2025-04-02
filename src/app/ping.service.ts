import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PingService {
  constructor(private http: HttpClient) {}

  ping() {
    return this.http.get(`https://prompteur-render.onrender.com/ping`, { responseType: 'text' });
  }
}
