import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private pathService = environment.apiUrl + 'contact';

  constructor(private http: HttpClient) {}

  sendMessage(data: { name: string; email: string; message: string }): Observable<String> {
    return this.http.post<string>(this.pathService, data, {
      responseType: 'text' as 'json'  
    });
      }}
