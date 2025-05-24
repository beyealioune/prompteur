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
  public platform = inject(Platform);
  private authService = inject(AuthService);

  public isStoreReady = false;
  public productLoaded = false;
  private iapInitialized = false;

  constructor() {
    this.initIAP();
  }

  private initIAP(): void {
    console.log('[IAP] initIAP called');
    if (this.platform.is('ios') && this.platform.is('hybrid')) {
      if (document.readyState === 'complete') {
        this.initializeIAP();
      } else {
        document.addEventListener('deviceready', () => this.initializeIAP(), false);
      }
    } else {
      console.log('[IAP] Not iOS or not hybrid, skip init');
    }
  }

  private async initializeIAP(): Promise<void> {
    if (this.iapInitialized) {
      console.log('[IAP] Already initialized');
      return;
    }
    this.iapInitialized = true;

    console.log('[IAP] Waiting for window.store...');
    await this.waitForStore();

    try {
      console.log('[IAP] window.store is present:', typeof window.store !== "undefined");
      window.store.verbosity = window.store.DEBUG;
      console.log('[IAP] Verbosity set to DEBUG');

      window.store.register([{
        id: "prompteur_1_9",
        type: window.store.PAID_SUBSCRIPTION
      }]);
      console.log('[IAP] Product registered');

      window.store.when("prompteur_1_9")
        .approved((order: any) => {
          console.log('[IAP] Purchase approved!', order);
          this.handleApprovedOrder(order);
        })
        .owned((product: any) => {
          console.log('[IAP] Product owned (déjà acheté ou abonnement actif)', product);
        })
        .updated((prod: any) => {
          console.log('[IAP] Product updated', prod);
        })
        .cancelled((order: any) => {
          console.log('[IAP] Purchase cancelled', order);
        })
        .error((err: any) => {
          console.error('[IAP] Purchase error:', err);
        });

      console.log('[IAP] Handlers set for approved/owned/error/updated/cancelled');

      window.store.ready(() => {
        this.isStoreReady = true;
        this.productLoaded = !!window.store.get('prompteur_1_9')?.loaded;
        console.log('[IAP] Store is ready', window.store.get('prompteur_1_9'));
      });

      window.store.error((error: any) => {
        console.error('[IAP] StoreKit ERROR (global):', error);
      });

      window.store.refresh();
      console.log('[IAP] Store refresh triggered');
    } catch (e) {
      console.error('[IAP] IAP init failed (catch):', e);
    }
  }

  private waitForStore(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (typeof window.store !== 'undefined') {
          console.log('[IAP] window.store detected');
          resolve();
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
  }

  async startApplePurchase(productId: string): Promise<{success: boolean, message?: string}> {
    console.log('[IAP] startApplePurchase:', productId);
    try {
      if (!this.platform.is('ios')) {
        return {success: false, message: 'iOS only'};
      }
      await this.waitForStoreReady();

      const product = window.store.get(productId);
      if (!product?.loaded) {
        console.warn('[IAP] Product not loaded, refreshing store...');
        window.store.refresh();
        return {success: false, message: 'Product not loaded'};
      }

      return new Promise((resolve) => {
        const done = (success: boolean, message?: string) => {
          window.store.off(handler);
          resolve({success, message});
        };

        const handler = window.store.when(productId)
          .approved((order: any) => {
            console.log('[IAP] Order approved in purchase', order);
            done(true);
          })
          .error((err: any) => {
            console.error('[IAP] Order error in purchase:', err);
            done(false, err.message);
          });

        window.store.order(productId);
        console.log('[IAP] Order triggered');
      });

    } catch (e) {
      console.error('[IAP] startApplePurchase failed:', e);
      return {success: false, message: this.getErrorMessage(e)};
    }
  }

  private waitForStoreReady(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isStoreReady) return resolve();

      const check = () => {
        if (this.isStoreReady) {
          console.log('[IAP] Store is ready (waitForStoreReady)');
          resolve();
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
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

  logProduct(): void {
    if (typeof window.store !== 'undefined') {
      console.log('[IAP] Product:', window.store.get('prompteur_1_9'));
      alert('Product info logged');
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
