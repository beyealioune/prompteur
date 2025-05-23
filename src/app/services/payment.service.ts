import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

declare var store: any;

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
    console.log('typeof store :', typeof store);

if (typeof store === 'undefined') {
  alert('❌ Le plugin natif In-App Purchase (cordova-plugin-purchase) N’EST PAS actif. Aucun achat Apple possible !');
} else {
  alert('✅ Plugin In-App Purchase détecté !');
}

    // Vérification de la plateforme et du plugin natif
    if (!this.platform.is('ios')) {
      console.warn('⚠️ IAP non disponible (non-iOS)');
      return;
    }
    if (typeof store === 'undefined') {
      alert("❌ Le plugin d'achat in-app (cordova-plugin-purchase) n'est pas disponible. Installe-le et fais un npx cap sync !");
      console.error('❌ typeof store:', typeof store);
      return;
    }
  
    try {
      store.verbosity = store.DEBUG;
  
      // Enregistre le produit d'abonnement
      store.register({
        id: 'prompteur_1_9',
        type: store.PAID_SUBSCRIPTION
      });
  
      // Handler lors de la validation de l'achat par Apple
      store.when('prompteur_1_9').approved((order: any) => {
        const receipt = order.transaction && order.transaction.appStoreReceipt;
  
        if (receipt) {
          // Récupère l'email utilisateur connecté (via AuthService)
          const userEmail = this.authService.getCurrentUserEmail();
          if (!userEmail) {
            alert('❌ Impossible de valider l\'achat : email utilisateur non trouvé');
            return;
          }
  
          // Envoie le reçu + email au backend
          this.sendReceiptToBackend(receipt, userEmail).subscribe({
            next: () => {
              order.finish();
              alert('✅ Abonnement validé et enregistré !');
            },
            error: (err) => {
              alert('❌ Erreur backend : ' + err.message);
            }
          });
        } else {
          alert('❌ Aucun reçu Apple détecté');
        }
      });
  
      // Initialisation du store
      store.ready(() => {
        this.isStoreReady = true;
  
        const product = store.get('prompteur_1_9');
        this.productLoaded = !!product && product.loaded;
  
        console.log('✅ store.ready appelé');
        console.log('📦 Produit :', product);
        store.refresh();
      });
  
      store.error((err: any) => {
        console.error('❌ Erreur IAP :', err);
        alert('❌ Erreur achat : ' + err.message);
      });
  
    } catch (e) {
      console.error('❌ Exception dans initializeIAP :', e);
    }
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
