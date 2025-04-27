import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProfilService } from '../services/profil.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent {
  user: any = {};
  selectedFile: File | null = null;
  newPassword: string = '';

  constructor(private http: HttpClient,    private authService: AuthService,    private profilService: ProfilService,
  
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe((data) => {
      this.user = data;
    });
    console.log("coucou");
    
  }
  isTrialActive(): boolean {
    if (!this.user || !this.user.trialEnd) {
      return false;
    }
    const now = new Date();
    const trialEndDate = new Date(this.user.trialEnd);
    return trialEndDate > now;
  }
  
 onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadPhoto(): void {
    if (!this.selectedFile) return;
    this.profilService.uploadPhoto(this.user.id, this.selectedFile)
      .subscribe(() => alert('Photo mise à jour !'));
  }

  updateProfile(): void {
    console.log("oooooooooooo");
    
    this.profilService.updateProfile(this.user)
      .subscribe(() => alert('Profil mis à jour !'));
  }

  updatePassword(): void {
    this.profilService.updatePassword(this.newPassword)
      .subscribe(() => alert('Mot de passe changé !'));
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/default-profile.jpg';
  }

  cancelSubscription(): void {
    if (confirm("Souhaitez-vous vraiment désactiver votre abonnement ?")) {
      this.profilService.cancelSubscription().subscribe({
        next: (res) => {
          alert(res.message); // ✅ Récupère le message dynamique du backend
          this.user.isPremium = false;
        },
        error: (err) => {
          console.error("Erreur résiliation :", err);
          alert("Une erreur est survenue lors de la résiliation.");
        }
      });
    }
  }
  
  
}
