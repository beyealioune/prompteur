import { Component, EventEmitter, Output, inject } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { Platform } from '@angular/cdk/platform';
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

  isStoreReady = false;
  productLoaded = false;

  constructor() {
    this.setupStoreDebug();
  }

  onTryFree(): void {
    if (this.isIOS()) {
      this.paymentService.activateIosTrial().subscribe({
        next: () => alert("✅ Essai gratuit activé (iOS) !"),
        error: (err) => alert("Erreur activation iOS trial : " + err.message)
      });
    } else {
      this.paymentService.createTrialSession().subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert('Erreur Stripe : ' + err.message)
      });
    }
  }

  onPayNow(): void {
    if (this.isIOS()) {
      this.paymentService.startApplePurchase('prompteur_199');
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

  public isIOS(): boolean {
    return this.platform.IOS || /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private setupStoreDebug(): void {
    if (this.isIOS() && typeof store !== 'undefined') {
      store.ready(() => {
        this.isStoreReady = true;
        const product = store.get('prompteur_199');
        this.productLoaded = !!product && product.loaded;
      });
    }
  }

  refreshStore(): void {
    if (typeof store !== 'undefined') {
      store.refresh();
      alert('🔄 store.refresh() lancé');
    }
  }

  logStore(): void {
    if (typeof store !== 'undefined') {
      console.log('🧾 store.get("prompteur_199") =', store.get('prompteur_199'));
    }
  }
}
