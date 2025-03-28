import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private url = 'http://localhost:8080/api/contact';

  constructor(private http: HttpClient) {}

  sendMessage(data: { name: string; email: string; message: string }): Observable<void> {
    return this.http.post<void>(this.url, data);
  }}
