import { Injectable, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Platform } from "@ionic/angular";
import { Observable, BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

declare var store: any;
declare global {
  interface Window {
    store: any; // ou un type plus précis si tu veux, mais any suffit ici
  }
}


@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = environment.apiUrl + 'payment';
  private http = inject(HttpClient);
  private platform = inject(Platform);
  private authService = inject(AuthService);

  public isStoreReady$ = new BehaviorSubject<boolean>(false);
  public productLoaded$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initStore();
  }

  private initStore(): void {
    if (!this.platform.is('ios')) {
      return;
    }

    document.addEventListener('deviceready', () => {
      if (!window.store) {
        alert('❌ Store plugin not available');
        return;
      }

      window.store.verbosity = window.store.DEBUG;

      window.store.register({
        id: 'prompteur_1_9',
        type: window.store.PAID_SUBSCRIPTION,
        platform: 'ios'
      });

      window.store.when('prompteur_1_9').updated((product: any) => {
        this.productLoaded$.next(product && product.loaded);
      });

      window.store.when('prompteur_1_9').approved((order: any) => {
        this.handleApprovedOrder(order);
      });

      window.store.ready(() => {
        this.isStoreReady$.next(true);
        window.store.refresh();
      });

      window.store.error((error: any) => {
        console.error('Store error:', error);
        alert('Erreur Store : ' + (error && error.message));
      });

      window.store.init([{
        id: 'prompteur_1_9',
        type: window.store.PAID_SUBSCRIPTION
      }]);
    }, false);
  }

  private handleApprovedOrder(order: any): void {
    const receipt = order?.transaction?.appStoreReceipt;
    if (!receipt) {
      alert('❌ Reçu non trouvé');
      return;
    }
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      alert('❌ Email utilisateur manquant');
      return;
    }

    this.sendReceiptToBackend(receipt, userEmail).subscribe({
      next: () => {
        alert("✅ Abonnement validé !");
        order.finish();
      },
      error: (err) => {
        alert('Erreur validation reçu: ' + err.message);
      }
    });
  }

  startApplePurchase(productId: string): void {
    if (!this.platform.is('ios')) {
      alert('⚠️ Fonctionnement réservé à iOS');
      return;
    }

    if (!this.isStoreReady$.getValue() || !window.store) {
      alert('⚠️ Système de paiement Apple non prêt');
      return;
    }

    const product = window.store.get(productId);
    if (!product || !product.loaded) {
      alert('⚠️ Produit non disponible ou non chargé');
      window.store.refresh();
      return;
    }

    window.store.order(productId);
  }

  sendReceiptToBackend(receipt: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate-ios-receipt`, { receipt, email });
  }

  // Stripe / web
  activateIosTrial(): Observable<any> {
    return this.http.post(`${this.baseUrl}/ios-trial`, {});
  }

  createTrialSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/trial`);
  }

  createImmediateSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/now`);
  }

  // Outils de debug
  refreshStore(): void {
    if (window.store) {
      window.store.refresh();
      alert('🔄 Store rafraîchi');
    }
  }
  logStore(): void {
    if (window.store) {
      alert('Voir la console pour store');
      console.log('store:', window.store);
    }
  }
}
