// src/app/services/session.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly TOKEN_KEY = 'token';
  private userSubject = new BehaviorSubject<User | undefined>(undefined);
  private isLoggedSubject = new BehaviorSubject<boolean>(this.hasToken()); // 👈

  public user?: User;

  constructor(private authService: AuthService) {}

  get $user(): Observable<User | undefined> {
    return this.userSubject.asObservable();
  }

  get isLogged(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  public $isLogged(): Observable<boolean> {
    return this.isLoggedSubject.asObservable();
  }

  refreshUser(): Observable<User> {
    return this.authService.me().pipe(
      tap(user => {
        this.user = user;
        this.userSubject.next(user);
        this.isLoggedSubject.next(true); // 👈 Ajoute bien ça pour mettre à jour l’état de login
      })
    );
  }

  logIn(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.user = user;
    this.userSubject.next(user);
    this.isLoggedSubject.next(true); // 👈
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logOut(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.user = undefined;
    this.userSubject.next(undefined);
    this.isLoggedSubject.next(false); // 👈
  }

  hasAccess(): boolean {
    if (!this.user) return false;
    return !!this.user.isPremium || this.isTrialValid();
  }

  private isTrialValid(): boolean {
    return this.user?.trialEnd ? new Date() <= new Date(this.user.trialEnd) : false;
  }

  // Ajoute ce helper privé
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
