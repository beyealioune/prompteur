import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly TOKEN_KEY = 'token'; // Clé unique pour le stockage
  private isLoggedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public user: User | undefined;

  constructor() {
  }

  // Getter basé sur la présence du token
  public get isLogged(): boolean {
    return this.hasToken();
  }

  // Observable pour écouter les changements
  public $isLogged(): Observable<boolean> {
    return this.isLoggedSubject.asObservable();
  }

  // Connexion (stocke le token + met à jour l'état)
  public logIn(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.user = user;
    this.isLoggedSubject.next(true);
  }

  // Déconnexion (supprime le token + nettoie l'état)
  public logOut(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.user = undefined;
    this.isLoggedSubject.next(false);
  }

  // Vérifie la présence du token
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Récupère le token (pour l'intercepteur)
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Gestion des accès premium/trial
  public hasAccess(): boolean {
    if (!this.user) return false;
    return this.user.isPremium || this.isTrialValid();
  }

  private isTrialValid(): boolean {
    return this.user?.trialEnd ? new Date() <= new Date(this.user.trialEnd) : false;
  }
}