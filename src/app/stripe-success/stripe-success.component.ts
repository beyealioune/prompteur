import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-stripe-success',
  standalone: true,
  imports: [],
  templateUrl: './stripe-success.component.html',
  styleUrl: './stripe-success.component.css'
})
export class StripeSuccessComponent {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.http.get<any>('https://prompteur-render.onrender.com/api/payment/confirm?session_id=' + sessionId)
          .subscribe({
            next: (user) => {
              // ✅ Met à jour l’utilisateur comme premium
              this.sessionService.logIn(user, this.sessionService.getToken()!); // on conserve le token
              this.router.navigate(['/prompteur']);
            },
            error: (err) => {
              console.error(err);
              this.router.navigate(['/connexion']);
            }
          });
      }
    });
  }
}
