import { Component, EventEmitter, Output } from '@angular/core';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [],
  templateUrl: './payment-popup.component.html',
  styleUrl: './payment-popup.component.css'
})
export class PaymentPopupComponent {
  @Output() close = new EventEmitter<void>();

  constructor(private paymentService: PaymentService) {}

  onTryFree(): void {
    if (this.isIOS()) {
      this.paymentService.activateIosTrial().subscribe({
        next: () => alert("Essai gratuit iOS activé !"),
        error: (err) => alert("Erreur activation iOS trial : " + err.message)
      });
    } else {
      this.paymentService.createTrialSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur : ' + err.message)
      });
    }
  }
  

  onPayNow(): void {
    if (this.isIOS()) {
      this.paymentService.startApplePurchase('prompteur_199');
    } else {
      this.paymentService.createImmediateSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur lors du paiement : ' + err.message)
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}
