import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController, LoadingController } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, RouterLink, IonicModule],
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

  async onTryFree(): Promise<void> {
    const loading = await this.showLoading();
    
    try {
      if (this.isIOS()) {
        await this.paymentService.activateIosTrial().toPromise();
        await this.showAlert('Succès', 'Essai gratuit activé!');
      } else {
        const res = await this.paymentService.createTrialSession().toPromise();
        window.location.href = res!.url;
      }
    } catch (err: any) {
      await this.showAlert('Erreur', this.getUserFriendlyError(err));
    } finally {
      await loading.dismiss();
    }
  }

  async onPayNow(): Promise<void> {
    const loading = await this.showLoading();
    
    try {
      if (this.isIOS()) {
        const result = await this.paymentService.startApplePurchase('prompteur_1_9');
        
        if (result.success) {
          await this.showAlert('Succès', 'Achat effectué avec succès!');
        } else {
          await this.showAlert('Information', result.message || 'Achat annulé');
        }
      } else {
        const res = await this.paymentService.createImmediateSession().toPromise();
        window.location.href = res!.url;
      }
    } catch (err: any) {
      await this.showAlert('Erreur', this.getUserFriendlyError(err));
    } finally {
      await loading.dismiss();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  private async showLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      message: 'Traitement en cours...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  private getUserFriendlyError(error: any): string {
    if (error?.message?.includes('cancelled')) return 'Opération annulée';
    if (error?.status === 0) return 'Problème de connexion';
    return error?.message || 'Une erreur est survenue';
  }
}