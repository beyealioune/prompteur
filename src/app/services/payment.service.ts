import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

// Ne jamais importer directement store comme un module
declare var store: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiUrl + 'payment';
  private http = inject(HttpClient);
  private platform = inject(Platform);
  private isStoreReady = false;

  constructor() {
    this.initializeIAP();
  }

  private initializeIAP(): void {
    if (!this.platform.is('ios') || typeof store === 'undefined') {
      console.warn('⚠️ IAP non disponible (non-iOS ou store manquant)');
      return;
    }

    try {
      store.verbosity = store.DEBUG;

      store.register({
        id: 'prompteur_199',
        type: store.PAID_SUBSCRIPTION
      });

      store.when('prompteur_199').approved((order: any) => {
        order.finish();
        alert('✅ Abonnement validé via Apple !');
        // Tu peux appeler ton backend ici
      });

      store.error((err: any) => {
        console.error('❌ Erreur IAP :', err);
        alert('❌ Erreur achat : ' + err.message);
      });

      store.ready(() => {
        this.isStoreReady = true;
        console.log('✅ store.ready appelé avec succès');
        store.refresh();
      });

    } catch (e) {
      console.error('❌ Exception dans initializeIAP :', e);
    }
  }

  startApplePurchase(productId: string): void {
    if (!this.platform.is('ios')) {
      alert('⚠️ Fonctionnement réservé à iOS');
      return;
    }

    if (!this.isStoreReady || typeof store === 'undefined') {
      console.log("paiement pas pret sur apple ");
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
