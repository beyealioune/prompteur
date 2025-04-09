import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css'
})
export class TermsAndConditionsComponent {
  constructor(private router: Router) {}

  closePage(): void {
    this.router.navigate(['/profil']).catch((err) => {
      console.error("Navigation failed:", err);
      this.router.navigate(['/accueil']); // Fallback vers une route publique
    });
  }
}
