import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { PingService } from './ping.service';
import { CommonModule } from '@angular/common';
import { SessionService } from './services/session.service';
import { HttpClient } from '@angular/common/http';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'prompteur';
  message = '';
  isLogged = false;
  isLoadingSession = true; // ⏳ bloque l’affichage jusqu’à chargement complet

  constructor(
    private pingService: PingService,
    private sessionService: SessionService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
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

    this.sessionService.$isLogged().subscribe(logged => {
      this.isLogged = logged;
    });

    this.pingService.ping().subscribe({
      next: (res) => this.message = res,
      error: (err) => this.message = 'Erreur : ' + err.status
    });
  }
}
    

