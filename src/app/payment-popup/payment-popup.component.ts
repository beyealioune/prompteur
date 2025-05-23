import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import 'cordova-plugin-purchase';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.css']
})
export class PaymentPopupComponent {
  @Output() close = new EventEmitter<void>();
  paymentService = inject(PaymentService);
  platform = inject(Platform);

  isIOS(): boolean {
    return this.platform.is('ios') || /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  onTryFree(): void {
    if (this.isIOS()) {
      this.paymentService.activateIosTrial().subscribe({
        next: () => alert("✅ Essai gratuit activé (iOS)!"),
        error: (err) => alert("Erreur activation iOS trial : " + err.message)
      });
    } else {
      this.paymentService.createTrialSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur Stripe : ' + err.message)
      });
    }
  }

  async onPayNow(): Promise<void> {
    if (this.isIOS()) {
      try {
        // Vérification que le store est prêt
        if (!this.paymentService.isStoreReady) {
          alert('Le système de paiement se prépare, veuillez réessayer dans quelques secondes');
          return;
        }
        
        this.paymentService.startApplePurchase('prompteur_1_9');
      } catch (e) {
        alert('Erreur lors de l\'achat: ' + (e as Error).message);
      }
    } else {
      this.paymentService.createImmediateSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur Stripe: ' + err.message)
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}