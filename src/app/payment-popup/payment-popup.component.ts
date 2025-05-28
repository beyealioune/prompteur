import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';


declare global {
  interface Window {
    store: any;
  }
}

const PRODUCT_KEY = 'prompteur_1_9';


@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, RouterLink, IonicModule],
  templateUrl: './payment-popup.component.html',
  styleUrl: './payment-popup.component.css'
})
export class PaymentPopupComponent {
  // @Output() close = new EventEmitter<void>();
  // private paymentService = inject(PaymentService);
  // private platform = inject(Platform);

  // public get isStoreReady(): boolean {
  //   return this.paymentService.isStoreReady;
  // }

  // public get productLoaded(): boolean {
  //   return this.paymentService.productLoaded;
  // }

  // public isIOS(): boolean {
  //   return this.platform.is('ios') || /iPad|iPhone|iPod/.test(navigator.userAgent);
  // }

  // onTryFree(): void {
  //   if (this.isIOS()) {
  //     this.paymentService.activateIosTrial().subscribe({
  //       next: () => alert("✅ Essai gratuit activé (iOS) !"),
  //       error: (err) => alert("Erreur activation iOS trial : " + err.message)
  //     });
  //   } else {
  //     this.paymentService.createTrialSession().subscribe({
  //       next: (res) => window.location.href = res.url,
  //       error: (err) => alert('Erreur Stripe : ' + err.message)
  //     });
  //   }
  // }

  // onPayNow(): void {
  //   if (this.isIOS()) {
  //     this.paymentService.startApplePurchase('prompteur_1_9');
  //   } else {
  //     this.paymentService.createImmediateSession().subscribe({
  //       next: (res) => window.location.href = res.url,
  //       error: (err) => alert('Erreur Stripe : ' + err.message)
  //     });
  //   }
  // }

  // onClose(): void {
  //   this.close.emit();
  // }

  // refreshStore(): void {
  //   this.paymentService.refreshStore();
  // }




  products: IAPProduct[] = [];
  isSubscribed = false;
  public product: any;

  constructor(
    private plt: Platform,
    private store: InAppPurchase2,
    private alertController: AlertController,
    private ref: ChangeDetectorRef,
    private iap: InAppPurchase2 // <= ici

  ) {
    this.plt.ready().then(() => {
      this.store.verbosity = this.store.DEBUG;

      this.registerProducts();
      this.setupListeners();

      this.store.ready(() => {
        this.products = this.store.products;
        this.ref.detectChanges();
      });
    });
  }

  registerProducts() {
    this.store.register({
      id: PRODUCT_KEY,
      type: this.store.PAID_SUBSCRIPTION,
    });

    this.store.refresh();
  }

  setupListeners() {
    this.store.when(PRODUCT_KEY)
      .approved((p: IAPProduct) => {
        this.isSubscribed = true;
        this.ref.detectChanges();
        return p.verify();
      })
      .verified((p: IAPProduct) => p.finish());

    this.store.when(PRODUCT_KEY)
      .owned((p: IAPProduct) => {
        this.isSubscribed = true;
      });
  }

  purchase(product: IAPProduct) {
    this.store.order(product).then((p: any) => {
      // Traitement après achat
    }, (e: any) => {
      this.presentAlert('Failed', `Failed to purchase: ${e}`);
    });
  }

  restore() {
    this.store.refresh();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
