import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

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
  private iapInitialized = false;

  constructor() {
    if (this.platform.is('ios')) {
      document.addEventListener('deviceready', () => this.initializeIAP(), false);
    }
  }

  // Fonction utilitaire pour avoir un message d'erreur typescript-safe
  private getErrorMessage(err: any): string {
    if (err && typeof err === 'object') {
      if ('message' in err) {
        return (err as any).message;
      }
      return JSON.stringify(err);
    }
    return String(err);
  }

  private initializeIAP(): void {
    if (this.iapInitialized) return;
    
    // Attendre que le store soit disponible
    const checkStore = () => {
      if (typeof window.store !== 'undefined' && typeof window.store.when === 'function') {
        this.setupStore();
        this.iapInitialized = true;
      } else {
        setTimeout(checkStore, 500);
      }
    };
    
    checkStore();
  }
  
  private setupStore(): void {
    try {
      window.store.verbosity = window.store.DEBUG;
  
      // Configurer les produits
      window.store.register({
        id: "prompteur_1_9",
        type: window.store.PAID_SUBSCRIPTION
      });
  
      // Configurer les handlers
      window.store.when("prompteur_1_9").approved((order: any) => {
        this.handleApprovedOrder(order);
      });
  
      window.store.error((err: any) => {
        console.error('Erreur IAP:', err);
      });
  
      window.store.ready(() => {
        this.isStoreReady = true;
        console.log('Store prêt');
      });
  
      window.store.refresh();
    } catch (e) {
      console.error('Erreur lors de la configuration du store:', e);
    }
  }

  private handleApprovedOrder(order: any): void {
    const receipt = order?.transaction?.appStoreReceipt;
    if (!receipt) {
      alert('❌ Aucun reçu Apple détecté');
      return;
    }

    const userEmail = this.authService.getCurrentUserEmail?.();
    if (!userEmail) {
      alert('❌ Email utilisateur non trouvé');
      return;
    }

    this.sendReceiptToBackend(receipt, userEmail).subscribe({
      next: () => {
        order.finish();
        alert('✅ Abonnement validé et enregistré !');
      },
      error: (err) => {
        alert('❌ Erreur backend : ' + this.getErrorMessage(err));
      }
    });
  }

  startApplePurchase(productId: string): void {
    alert('🟢 Tentative d’achat Apple');

    if (!this.platform.is('ios')) {
      alert('⚠️ Fonctionnement réservé à iOS');
      return;
    }

    if (!this.isStoreReady || typeof window.store === 'undefined') {
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

  refreshStore(): void {
    if (typeof window.store !== 'undefined') {
      window.store.refresh();
      alert('🔄 Store rafraîchi');
    }
  }

  logStore(): void {
    if (typeof window.store !== 'undefined') {
      console.log('📋 store:', window.store);
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
