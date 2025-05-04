import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Platform } from '@angular/cdk/platform';
declare var store: any;
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private platform = inject(Platform);
  private baseUrl = environment.apiUrl + 'payment';

  // 🌍 Pour Android/Web : créer une session Stripe pour essai gratuit
  createTrialSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/trial`);
  }

  // 🌍 Pour Android/Web : créer une session Stripe pour achat immédiat
  createImmediateSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/now`);
  }

  startApplePurchase(productId: string): void {
    if (!this.platform.IOS) {
      alert('⚠️ Les achats in-app ne sont disponibles que sur iOS');
      return;
    }

    if (typeof store === 'undefined') {
      alert('⚠️ Le système d\'achat n\'est pas disponible');
      return;
    }

    store.verbosity = store.DEBUG;

    store.register({
      id: productId,
      type: store.PAID_SUBSCRIPTION,
    });

    store.when(productId).approved((order: any) => {
      order.finish();
      alert("✅ Achat validé !");
    });

    store.error((err: any) => {
      console.error('IAP Error:', err);
      alert('❌ Erreur achat Apple : ' + err.message);
    });

    store.ready(() => {
      const product = store.get(productId);
      if (product) {
        store.order(productId);
      } else {
        alert('Produit non trouvé');
        store.refresh();
      }
    });

    store.refresh();
  }

  activateIosTrial(): Observable<any> {
    return this.http.post(`${this.baseUrl}/ios-trial`, {});
  }
}