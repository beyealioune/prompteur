import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // const auth = inject(AuthService);
  const token = localStorage.getItem('token');

  if (!token) { 
    return next(req)
  }
console.log('test token',token);

  const headers = new HttpHeaders({
    Authorization: "Bearer "+ token
  })

  const newReq = req.clone({
    headers
  })

  return next(newReq)
}