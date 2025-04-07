import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
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
    this.paymentService.createTrialSession().subscribe({
      next: (res) => window.location.href = res.url,
      error: (err) => alert('Erreur lors de la création de la session : ' + err.message)
    });
  }

  onPayNow(): void {
    this.paymentService.createImmediateSession().subscribe({
      next: (res) => window.location.href = res.url,
      error: (err) => alert('Erreur lors du paiement : ' + err.message)
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
