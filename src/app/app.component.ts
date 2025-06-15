import { Component, OnInit, inject } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { PingService } from './ping.service';
import { CommonModule } from '@angular/common';
import { SessionService } from './services/session.service';
import { HttpClient } from '@angular/common/http';
import { User } from './models/user';
import { Platform } from '@angular/cdk/platform';
import { Router, RouterOutlet } from '@angular/router';
import { StatusBar } from '@capacitor/status-bar';

declare var store: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'prompteur';
  message = '';
  isLogged = false;
  isLoadingSession = true;
  private platform = inject(Platform);

  constructor(
    private pingService: PingService,
    private sessionService: SessionService,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

StatusBar.setOverlaysWebView({ overlay: false });
    // ✅ Chargement session utilisateur
    const token = this.sessionService.getToken();
    if (token && !this.sessionService.user) {
      this.http.get<User>('https://prompteur-render.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (user) => {
          this.sessionService.logIn(user, token);
          this.router.navigate(['/prompteur']);
          this.isLoadingSession = false;
        },
        error: () => {
          this.sessionService.logOut();
          this.router.navigate(['/connexion']);
          this.isLoadingSession = false;
        }
      });
    } else {
      this.isLoadingSession = false;
    }

    // ✅ Suivi de l'état de login
    this.sessionService.$isLogged().subscribe(logged => {
      this.isLogged = logged;
    });

    // ✅ Ping pour test de connectivité
    this.pingService.ping().subscribe({
      next: (res) => this.message = res,
      error: (err) => this.message = 'Erreur : ' + err.status
    });

    // ✅ Vérification si iOS natif
    if (this.isIosNative() && typeof store !== 'undefined') {
      store.ready(() => {
        console.log('✅ store.ready appelé dans AppComponent');
      });
    }
  }

  private isIosNative(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isNotOldIE = !(window as any).MSStream;
    return isIOS && isNotOldIE;
  }
  
}
