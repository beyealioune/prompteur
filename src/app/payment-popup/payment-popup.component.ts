import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


declare global {
  interface Window {
    store: any;
  }
}

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, RouterLink],
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


  products: any[] = [];
  isPremium = false;
  storeNotReady = false;

  private SUBSCRIPTION_ID = 'prompteur_1_9'; // à adapter si besoin
  private store: any;

  constructor(private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.initStore();
  }

  initStore() {
    // Sécurité : attendre que cordova soit prêt si besoin
    document.addEventListener('deviceready', () => this.setupStore(), false);
    // Pour navigateur/simulateur (utile debug sur Chrome)
    setTimeout(() => this.setupStore(), 1500);
  }

  setupStore() {
    this.store = window.store;
    if (!this.store) {
      this.storeNotReady = true;
      return;
    }
    this.storeNotReady = false;
    this.store.verbosity = this.store.DEBUG;

    this.registerProducts();
    this.setupListeners();

    this.store.ready(() => {
      this.products = this.store.products ? Object.values(this.store.products) : [];
      this.ref.detectChanges();
    });

    this.store.refresh();
  }

  registerProducts() {
    this.store.register({
      id: this.SUBSCRIPTION_ID,
      type: this.store.PAID_SUBSCRIPTION,
      platform: 'ios'
    });
  }

  setupListeners() {
    this.store.when(this.SUBSCRIPTION_ID).approved((order: any) => {
      // Ici tu peux traiter le reçu etc.
      this.isPremium = true;
      order.finish();
      alert('✅ Achat validé !');
      this.ref.detectChanges();
    });

    this.store.when(this.SUBSCRIPTION_ID).owned((p: any) => {
      this.isPremium = true;
      this.ref.detectChanges();
    });

    this.store.error((err: any) => {
      alert('Erreur IAP : ' + JSON.stringify(err));
    });
  }

  purchase(productId: string) {
    if (!this.store) return;
    this.store.order(productId);
  }

  restore() {
    if (this.store) this.store.refresh();
  }
}
