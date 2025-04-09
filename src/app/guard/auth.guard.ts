import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor( 
    private router: Router,
    private sessionService: SessionService,
  ) {
  }

// auth.guard.ts
public canActivate(): boolean {
  const token = localStorage.getItem('token'); // Même méthode que l'intercepteur
  if (!token) {
    this.router.navigate(['/connexion']);
    return false;
  }
  return true;
}
  
}
