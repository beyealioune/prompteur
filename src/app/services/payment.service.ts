import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import 'cordova-plugin-purchase';

declare global {
  interface Window {
    CdvPurchase: any;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = environment.apiUrl + 'payment';
  private http = inject(HttpClient);
  private platform = inject(Platform);
  private authService = inject(AuthService);

  public isStoreReady = false;
  public productLoaded = false;
  private store: any;

  constructor() {
    if (this.platform.is('ios')) {
      document.addEventListener('deviceready', () => this.initializeIAP(), false);
    }
  }

  private initializeIAP(): void {
    const CdvPurchase = window.CdvPurchase;
    if (!CdvPurchase) {
      alert('❌ CdvPurchase indisponible');
      return;
    }

    this.store = CdvPurchase.store;

    this.store.register({
      id: 'prompteur_1_9',
      type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
      platform: CdvPurchase.Platform.APPLE_APPSTORE
    });

    this.store.when()
      .productUpdated((product: any) => {
        if (product.id === 'prompteur_1_9') {
          this.productLoaded = product.loaded;
          this.isStoreReady = true;
        }
      })
      .approved((transaction: any) => {
        transaction.verify();
      })
      .verified((receipt: any) => {
        this.handleApprovedOrder(receipt);
        receipt.finish();
      })
      .error((err: any) => {
        alert('❌ Erreur achat : ' + err.message);
        console.error('❌ IAP Error:', err);
      });

    this.store.initialize([
      { platform: CdvPurchase.Platform.APPLE_APPSTORE }
    ]);
  }

  private handleApprovedOrder(receipt: any): void {
    const receiptData = receipt.transaction?.appStoreReceipt || receipt.receipt;
    const userEmail = this.authService.getCurrentUserEmail();

    if (!receiptData || !userEmail) {
      alert('❌ Infos insuffisantes pour valider l\'achat');
      return;
    }

    this.sendReceiptToBackend(receiptData, userEmail).subscribe({
      next: () => alert('✅ Abonnement validé et enregistré !'),
      error: (err) => alert('❌ Erreur backend : ' + err.message)
    });
  }

  startApplePurchase(): void {
    if (!this.isStoreReady || !this.store) {
      alert('⚠️ Store non initialisé');
      return;
    }

    const product = this.store.get('prompteur_1_9');
    if (!product?.loaded) {
      alert('⚠️ Produit non chargé');
      this.store.refresh();
      return;
    }

    product.getOffer()?.order();
  }

  sendReceiptToBackend(receipt: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate-ios-receipt`, { receipt, email });
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

  refreshStore(): void {
    this.store?.refresh();
    alert('🔄 Store rafraîchi');
  }

  logStore(): void {
    console.log('📋 store:', this.store);
    alert('📋 Voir la console');
  }
}
