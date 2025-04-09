import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {

  constructor(private router: Router) {}

  faqItems = [

    {
      question: 'Comment puis-je créer un compte ?',
      answer: 'Pour créer un compte, cliquez sur le bouton "S\'inscrire" en haut de la page et remplissez le formulaire.',
      open: false
    },
    // Ajoutez d'autres questions-réponses selon vos besoins
  ];

  closePage(): void {
    this.router.navigate(['/profil']).catch((err) => {
      console.error("Navigation failed:", err);
      this.router.navigate(['/accueil']); // Fallback vers une route publique
    });
  }
      

  toggle(item: any): void {
    item.open = !item.open;
  }
}
