import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController, LoadingController } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { TestComponent } from '../test/test.component';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.css']
})
export class PaymentPopupComponent {
  @Output() close = new EventEmitter<void>();
  private paymentService = inject(PaymentService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  isIOS(): boolean {
    return this.paymentService.platform.is('ios') || 
           /iPad|iPhone|iPod/.test(navigator.userAgent);
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

  async onPayNow(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Préparation du paiement...',
      spinner: 'crescent'
    });
    await loading.present();
  
    try {
      if (this.isIOS()) {
        // Attendre que le store soit prêt
        if (!this.paymentService.isStoreReady) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
  
        const result = await this.paymentService.startApplePurchase('prompteur_1_9');
        
        if (result.success) {
          await this.showAlert('Succès', 'Votre abonnement a été activé!');
        } else {
          await this.showAlert('Information', result.message || 'Le paiement a été annulé');
        }
      } else {
        // ... (garder le code Stripe existant)
      }
    } catch (e) {
      await this.showAlert('Erreur', this.getUserFriendlyError(e));
    } finally {
      await loading.dismiss();
    }
  }

  onDebug(): void {
    this.paymentService.logProduct();
  }

  onClose(): void {
    this.close.emit();
  }

  refreshStore(): void {
    this.paymentService.refreshStore();
  }
}
