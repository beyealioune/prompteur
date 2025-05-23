import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

declare var store: any;
declare global {
  interface Window {
    store: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiUrl + 'payment';
  private http = inject(HttpClient);
  private platform = inject(Platform);
  private authService = inject(AuthService);

  public isStoreReady = false;
  public productLoaded = false;

  constructor() {
    this.initializeIAP();
  }
  private initializeIAP(): void {
    if (!this.platform.is('ios')) {
      console.warn('IAP only available on iOS');
      return;
    }
  
    // Attendre que le device soit prêt
    document.addEventListener('deviceready', () => {
      try {
        if (typeof window.store === 'undefined') {
          console.error('Store plugin not available');
          return;
        }
  
        // Configuration du store
        window.store.verbosity = window.store.DEBUG;
  
        // Enregistrement du produit
        window.store.register({
          id: 'prompteur_1_9',
          type: window.store.PAID_SUBSCRIPTION,
          platform: 'apple'
        });
  
        // Gestion des événements
        window.store.when('prompteur_1_9').approved((order: any) => {
          this.handleApprovedOrder(order);
        });
  
        window.store.ready(() => {
          console.log('Store ready');
          this.isStoreReady = true;
          window.store.refresh();
        });
  
        window.store.error((error: any) => {
          console.error('Store error', error);
        });
  
        // Initialisation
        window.store.init([
          { id: 'prompteur_1_9', type: window.store.PAID_SUBSCRIPTION }
        ]);
  
      } catch (error) {
        console.error('IAP initialization error', error);
      }
    }, false);
  }
  
  private handleApprovedOrder(order: any): void {
    const receipt = order?.transaction?.appStoreReceipt;
    if (!receipt) {
      console.error('No receipt found');
      return;
    }
  
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      console.error('No user email');
      return;
    }
  
    this.sendReceiptToBackend(receipt, userEmail).subscribe({
      next: () => order.finish(),
      error: (err) => console.error('Receipt validation failed', err)
    });
  }

  startApplePurchase(productId: string): void {
    alert('🟢 Tentative d’achat Apple');

    if (!this.platform.is('ios')) {
      alert('⚠️ Fonctionnement réservé à iOS');
      return;
    }

    if (!this.isStoreReady || typeof store === 'undefined') {
      alert('⚠️ Système de paiement Apple non prêt');
      return;
    }

    const product = store.get(productId);
    if (!product || !product.loaded) {
      alert('⚠️ Produit non disponible ou non chargé');
      store.refresh();
      return;
    }

    store.order(productId);
  }

  sendReceiptToBackend(receipt: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate-ios-receipt`, { receipt, email });
  }
  

  refreshStore(): void {
    if (typeof store !== 'undefined') {
      store.refresh();
      alert('🔄 Store rafraîchi');
    }
  }

  logStore(): void {
    if (typeof store !== 'undefined') {
      console.log('📋 store:', store);
      alert('📋 Voir la console');
    }
  }

  activateIosTrial(): Observable<any> {
    return this.http.post(`${this.baseUrl}/ios-trial`, {});
  }

  createTrialSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/trial`);
  }

  createImmediateSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/now`);
  }
}
