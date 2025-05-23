import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-popup.component.html',
  styleUrl: './payment-popup.component.css'
})
export class PaymentPopupComponent {
  @Output() close = new EventEmitter<void>();
  private paymentService = inject(PaymentService);
  private platform = inject(Platform);

  isStoreReady$: Observable<boolean> = this.paymentService.isStoreReady$;
  productLoaded$: Observable<boolean> = this.paymentService.productLoaded$;

  isIOS(): boolean {
    return this.platform.is('ios') || /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  refreshStore(): void {
    this.paymentService.refreshStore();
  }

  logStore(): void {
    this.paymentService.logStore();
  }

  onPayNow(): void {
    alert('onPayNow appelé');
    this.paymentService.startApplePurchase('prompteur_1_9');
  }
  onTryFree(): void {
    alert('onTryFree appelé');
    this.paymentService.activateIosTrial().subscribe({
      next: () => alert("✅ Essai gratuit activé (iOS) !"),
      error: (err) => alert("Erreur activation essai : " + (err?.error?.error || err.message))
    });
  }
  

  onClose(): void {
    this.close.emit();
  }
}
