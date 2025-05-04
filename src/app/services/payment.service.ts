import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare var store: any; // ⚠️ nécessaire pour cordova-plugin-purchase

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = environment.apiUrl + 'payment';

  constructor(private http: HttpClient) {}

  // 🌍 Pour Android/Web : créer une session Stripe pour essai gratuit
  createTrialSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/trial`);
  }

  // 🌍 Pour Android/Web : créer une session Stripe pour achat immédiat
  createImmediateSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/now`);
  }

  // 🍏 Pour iOS : déclencher un achat In-App (StoreKit via cordova-plugin-purchase)
  startApplePurchase(productId: string): void {
    store.verbosity = store.DEBUG;

    store.register({
      id: productId,
      type: store.PAID_SUBSCRIPTION
    });    

    store.when(productId).approved((order: any) => {
      order.finish();
      alert("✅ Achat validé !");
      // Optionnel : appeler ton backend ici pour activer premium
    });

    store.error((err: any) => {
      alert('❌ Erreur paiement Apple : ' + err.message);
    });

    store.ready(() => {
      store.order(productId);
    });

    store.refresh();
  }

  // Optionnel : appeler ton backend pour activer un essai sur iOS
  activateIosTrial(): Observable<any> {
    return this.http.post(`${this.baseUrl}/ios-trial`, {}); // À créer dans ton backend si besoin
  }
}
