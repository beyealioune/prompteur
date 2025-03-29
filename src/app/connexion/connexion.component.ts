import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

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
          this.router.navigate(['/prompteur']);
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

  onForgotPassword(): void {
    this.authService.forgotPassword(this.forgotEmail).subscribe(() => {
      this.emailSent = true;
    });
  }

  onVerifyOTP(): void {
    const code = this.otp.join('');
    console.log('Vérification OTP:', code);
    // logiques de vérif à ajouter
  }
}
