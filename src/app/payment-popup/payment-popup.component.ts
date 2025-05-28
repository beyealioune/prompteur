import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


declare global {
  interface Window {
    store: any;
  }
}

const PRODUCT_KEY = 'prompteur_1_9';


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

   public get isStoreReady(): boolean {
     return this.paymentService.isStoreReady;
   }

   public get productLoaded(): boolean {
     return this.paymentService.productLoaded;
   }

   public isIOS(): boolean {
     return this.platform.is('ios') || /iPad|iPhone|iPod/.test(navigator.userAgent);
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
      this.paymentService.startApplePurchase('prompteur_1_9');
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

   refreshStore(): void {
    this.paymentService.refreshStore();
   }



}
