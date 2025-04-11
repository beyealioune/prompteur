import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatIconModule, CommonModule],
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
      {
        question: 'Comment annuler mon abonnement ?',
        answer: 'Pour annuler votre abonnement, rendez-vous dans la section "Profil", puis cliquez sur le bouton "Résilier l\'abonnement".',
        open: false
      },
      {
        question: 'Comment nous contacter ?',
        answer: 'Pour nous contacter, cliquez sur l\'onglet "Contact" dans le menu de navigation.',
        open: false
      }
    ];
    
    // Ajoutez d'autres questions-réponses selon vos besoins
  
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
