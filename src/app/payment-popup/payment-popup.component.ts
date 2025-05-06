import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { CommonModule } from '@angular/common';

declare var store: any;

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-popup.component.html',
  styleUrl: './payment-popup.component.css'
})
export class PaymentPopupComponent {
  @Output() close = new EventEmitter<void>();
  private paymentService = inject(PaymentService);
  private platform = inject(Platform);

  onTryFree(): void {
    if (this.isIOS()) {
      this.paymentService.activateIosTrial().subscribe({
        next: () => alert("✅ Essai gratuit activé (iOS) !"),
        error: (err) => alert("Erreur activation iOS trial : " + err.message)
      })
    } else {
      this.paymentService.createTrialSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur Stripe : ' + err.message)
      });
    }
  }

  onPayNow(): void {
    if (this.isIOS()) {
      this.paymentService.startApplePurchase('prompteur_19');
    } else {
      this.paymentService.createImmediateSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur Stripe : ' + err.message)
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  private isIOS(): boolean {
    return this.platform.is('ios') || /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}


