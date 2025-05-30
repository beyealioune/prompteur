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

  // refreshStore(): void {
  //   this.paymentService.refreshStore();
  // }

  products: any[] = [];
  isPremium = false;
  storeNotReady = false;
  debugMsg = '';

  public SUBSCRIPTION_ID = 'prompteur_1_9';
  private store: any;

  constructor(private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.initStore();
  }

  initStore() {
    document.addEventListener('deviceready', () => this.setupStore(), false);
    // Pour debug navigateur/simulateur
    setTimeout(() => this.setupStore(), 2000);
  }
  getProductPrice(productId: string): string {
    if (this.store && this.store.products && this.store.products[productId]) {
      const prod = this.store.products[productId];
      // Apple donne déjà le prix formaté localement (ex: "1,99 €")
      return prod.price || 'Prix inconnu';
    }
    return 'Prix inconnu';
  }
  
  setupStore() {
    console.log('=== DEBUG INIT STORE ===');
    console.log('window.store:', window.store);

    this.store = window.store;
    if (!this.store) {
      this.storeNotReady = true;
      this.debugMsg = '❌ store is undefined. Plugin non chargé ou lancé dans le mauvais contexte.';
      console.log(this.debugMsg);
      return;
    }
    this.storeNotReady = false;

    this.store.verbosity = this.store.DEBUG;

    this.registerProducts();
    this.setupListeners();

    this.store.ready(() => {
      console.log('Store prêt callback');
      this.products = this.store.products ? Object.values(this.store.products) : [];
      console.log('Produits chargés :', this.products);

      if (this.store.products && this.store.products[this.SUBSCRIPTION_ID]) {
        console.log('Product details:', this.store.products[this.SUBSCRIPTION_ID]);
      } else {
        console.log('Produit non trouvé dans store.products');
      }
      this.ref.detectChanges();
    });

    this.store.refresh();

    // Re-log après un délai pour vérifier le chargement produit (propagation Apple)
    setTimeout(() => {
      if (this.store.products) {
        console.log('Products (after delay):', this.store.products);
        if (this.store.products[this.SUBSCRIPTION_ID]) {
          console.log('Product details (after delay):', this.store.products[this.SUBSCRIPTION_ID]);
        }
      }
    }, 4000);
  }

  registerProducts() {
    console.log('registerProducts called');
    this.store.register({
      id: this.SUBSCRIPTION_ID,
      type: this.store.PAID_SUBSCRIPTION,
      platform: 'ios'
    });
    console.log('registerProducts finished');
  }

  setupListeners() {
    this.store.when(this.SUBSCRIPTION_ID).approved((order: any) => {
      console.log('Achat approuvé :', order);
      this.isPremium = true;
      order.finish();
      alert('✅ Achat validé !');
      this.ref.detectChanges();
    });

    this.store.when(this.SUBSCRIPTION_ID).owned((p: any) => {
      console.log('Abonnement déjà possédé (owned) :', p);
      this.isPremium = true;
      this.ref.detectChanges();
    });

    this.store.error((err: any) => {
      console.log('Erreur IAP :', err);
      alert('Erreur IAP : ' + JSON.stringify(err));
    });
  }

  purchase(productId: string) {
    console.log('purchase() called for', productId);
    if (!this.store) {
      console.log('❌ store is undefined');
      return;
    }
    this.store.order(productId);
  }

  restore() {
    if (this.store) {
      console.log('Restore store...');
      this.store.refresh();
    }
  }
}
