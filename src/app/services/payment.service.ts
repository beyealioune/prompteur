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
    if (this.platform.is('ios')) {
      document.addEventListener('deviceready', () => this.initializeIAP(), false);
    }
  }

  private getErrorMessage(err: any): string {
    if (err && typeof err === 'object') {
      if ('message' in err) return (err as any).message;
      return JSON.stringify(err);
    }
    return String(err);
  }

  private async initializeIAP(): Promise<void> {
    if (this.iapInitialized) {
      console.log('[IAP] Already initialized');
      return;
    }
    this.iapInitialized = true;

    console.log('[IAP] Waiting for window.store...');
    await this.waitForStore();

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
    console.log('[IAP] handleApprovedOrder', order);
    const receipt = order?.transaction?.appStoreReceipt;
    if (!receipt) {
      console.error('[IAP] No receipt found in approved order');
      return;
    }
    const userEmail = this.authService.getCurrentUserEmail?.();
    if (!userEmail) {
      console.error('[IAP] No user email');
      return;
    }
    this.sendReceiptToBackend(receipt, userEmail).subscribe({
      next: () => {
        console.log('[IAP] Receipt sent to backend and validated');
        order.finish();
      },
      error: (err) => {
        console.error('[IAP] Receipt validation failed:', err);
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
    console.log('[IAP] sendReceiptToBackend', receipt, email);
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

  private getErrorMessage(err: any): string {
    if (err?.message) return err.message;
    return JSON.stringify(err);
  }
}
