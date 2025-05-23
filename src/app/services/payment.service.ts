import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

// Import du plugin (obligatoire avec Capacitor)
import "cordova-plugin-purchase";

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
  public store: any = null;

  constructor() {
    this.initializeIAP();
  }

  private initializeIAP(): void {
    this.platform.ready().then(() => {
      document.addEventListener('deviceready', () => {
        try {
          if (!(window as any).CdvPurchase || !(window as any).CdvPurchase.store) {
            alert('❌ CdvPurchase.store undefined');
            return;
          }
          this.store = (window as any).CdvPurchase.store;
          // Verbose pour debug
          this.store.verbosity = this.store.DEBUG;

          // Register product (ARRAY syntax)
          this.store.register([{
            id: 'prompteur_1_9',
            type: this.store.PAID_SUBSCRIPTION,
            platform: this.store.PLATFORM.APPLE_APPSTORE
          }]);

          // Setup event handlers (nouvelle API)
          this.store.when()
            .productUpdated(() => {
              this.productLoaded = true;
              console.log('Products loaded from the store');
            })
            .approved((transaction: any) => {
              this.handleApprovedOrder(transaction);
            })
            .error((error: any) => {
              console.error('IAP Error:', error);
              alert('Erreur IAP : ' + (error?.message ?? JSON.stringify(error)));
            });

          // Ready event
          this.store.ready(() => {
            this.isStoreReady = true;
            this.store.refresh();
            console.log('Store ready');
          });

          // Initialisation du store (IMPORTANT)
          this.store.initialize([{
            platform: this.store.PLATFORM.APPLE_APPSTORE,
            options: { needAppReceipt: true }
          }]);

        } catch (error: any) {
          alert('❌ Exception dans initializeIAP : ' + (error?.message || error));
          console.error('IAP initialization error', error);
        }
      }, false);
    });
  }

  private handleApprovedOrder(order: any): void {
    const receipt = order?.transaction?.appStoreReceipt;
    if (!receipt) {
      alert('No receipt found');
      return;
    }
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      alert('No user email');
      return;
    }
    this.sendReceiptToBackend(receipt, userEmail).subscribe({
      next: () => order.finish(),
      error: (err) => alert('Receipt validation failed: ' + JSON.stringify(err))
    });
  }

  startApplePurchase(productId: string): void {
    alert('🟢 Tentative d’achat Apple');
    if (!this.platform.is('ios')) {
      alert('⚠️ Fonctionnement réservé à iOS');
      return;
    }
    if (!this.isStoreReady || !this.store) {
      alert('⚠️ Système de paiement Apple non prêt');
      return;
    }
    const product = this.store.get(productId);
    if (!product || !product.loaded) {
      alert('⚠️ Produit non disponible ou non chargé');
      this.store.refresh();
      return;
    }
    // Nouvelle syntaxe d'achat (version 13+)
    product.getOffer()?.order()
      .then((error: any) => {
        if (error) {
          alert("Erreur achat : " + (error?.message ?? JSON.stringify(error)));
        }
      });
  }

  sendReceiptToBackend(receipt: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate-ios-receipt`, { receipt, email });
  }

  refreshStore(): void {
    if (this.store) {
      this.store.refresh();
      alert('🔄 Store rafraîchi');
    }
  }

  logStore(): void {
    if (this.store) {
      console.log('📋 store:', this.store);
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
