import { Injectable, NgZone } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiUrl + 'payment';
  public isStoreReady = false;
  public productLoaded = false;
  private iapInitialized = false;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private authService: AuthService,
    private zone: NgZone // très important !
  ) {

  }

  private getErrorMessage(err: any): string {
    if (err && typeof err === 'object') {
      if ('message' in err) return (err as any).message;
      return JSON.stringify(err);
    }
    return String(err);
  }

  private initializeIAP(): void {
    if (this.iapInitialized) return;
    this.iapInitialized = true;

    if (typeof window.store === 'undefined') {
      alert('❌ Le plugin natif In-App Purchase (cordova-plugin-purchase) n’est PAS actif. Aucun achat Apple possible !');
      return;
    }

    window.store.verbosity = window.store.DEBUG;

    window.store.register({
      id: 'prompteur_1_9',
      type: window.store.PAID_SUBSCRIPTION,
      platform: 'ios'
    });

    // Listener achat validé
    window.store.when('prompteur_1_9').approved((order: any) => {
      this.zone.run(() => this.handleApprovedOrder(order));
    });

    // Listener déjà abonné
    window.store.when('prompteur_1_9').owned((product: any) => {
      this.zone.run(() => {
        // Ici tu peux changer l’UI ou autre
        console.log('Déjà abonné (owned)');
      });
    });

    // Listener erreur
    window.store.error((err: any) => {
      this.zone.run(() => {
        alert('❌ Erreur achat : ' + this.getErrorMessage(err));
      });
    });

    window.store.ready(() => {
      this.zone.run(() => {
        this.isStoreReady = true;
        const product = window.store.get('prompteur_1_9');
        this.productLoaded = !!product && product.loaded;
        console.log('✅ Store prêt', product);
      });
    });

    window.store.refresh();
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

  // Partie Web & Stripe
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
