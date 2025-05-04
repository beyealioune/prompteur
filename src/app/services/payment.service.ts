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

  startApplePurchase(productId: string): void {
    if (typeof store === 'undefined' || typeof store.register !== 'function') {
      alert('⚠️ Le système d’achat Apple n’est pas prêt. Vérifiez que vous êtes bien dans l’application native.');
      return;
    }
  
    store.verbosity = store.DEBUG;
  
    // Vérifie si le produit est déjà enregistré
    if (!store.get(productId)) {
      store.register({
        id: productId,
        type: store.PAID_SUBSCRIPTION,
      });
    }
  
    // Récupère les événements
    store.when(productId).approved((order: any) => {
      order.finish();
      alert("✅ Achat validé !");
    });
  
    store.error((err: any) => {
      alert('❌ Erreur achat Apple : ' + err.message);
    });
  
    // ⚠️ Attendre que tout soit prêt avant de commander
    store.ready(() => {
      store.refresh();
      store.order(productId);
    });
  }
  
  
  // Optionnel : appeler ton backend pour activer un essai sur iOS
  activateIosTrial(): Observable<any> {
    return this.http.post(`${this.baseUrl}/ios-trial`, {}); // À créer dans ton backend si besoin
  }
}
