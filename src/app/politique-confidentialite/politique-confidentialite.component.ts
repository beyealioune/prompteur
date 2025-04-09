import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


@Component({
  selector: 'app-politique-confidentialite',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './politique-confidentialite.component.html',
  styleUrl: './politique-confidentialite.component.css'
})
export class PolitiqueConfidentialiteComponent {
  constructor(private router: Router) {}

  closePage(): void {
    this.router.navigate(['/profil']).catch((err) => {
      console.error("Navigation failed:", err);
      this.router.navigate(['/accueil']); // Fallback vers une route publique
    });
  }
}
