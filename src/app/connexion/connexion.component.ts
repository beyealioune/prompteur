import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { PaymentPopupComponent } from "../payment-popup/payment-popup.component";

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaymentPopupComponent],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotEmail: string = '';
  otp: string[] = ['', '', '', '', '', ''];

  onError = false;
  emailSent = false;
  currentView: 'login' | 'register' | 'forgot' | 'otp' = 'login';


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,private sessionService : SessionService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.authService.login(loginData).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.authService.me().subscribe({
            next: (user) => {
              this.sessionService.logIn(user, res.token);
              this.router.navigate(['/prompteur']); // 👈 Redirection après connexion réussie
            },
            error: () => {
              this.onError = true;
            }
          });
        },
        error: () => {
          this.onError = true;
        }
      });
    }
  }
  
  

  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      this.authService.register(registerData).subscribe(() => {
        this.currentView = 'login';
      });
    }
  }

  onForgotPassword(event?: Event): void {
    if (event) event.preventDefault(); // 👈 bloque l'effet par défaut du submit
  
    console.log("Appel de onForgotPassword() avec :", this.forgotEmail);
  
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        console.log("Réinitialisation envoyée !");
        this.emailSent = true;
      },
      error: (err) => {
        console.error("Erreur lors de la demande de réinitialisation :", err);
      }
    });
  }
  
  switchView(view: 'login' | 'register' | 'forgot' | 'otp') {
    this.currentView = view;
  }
  

  onVerifyOTP(): void {
    const code = this.otp.join('');
    console.log('Vérification OTP:', code);
    // logiques de vérif à ajouter
  }
}
