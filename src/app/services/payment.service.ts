import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Platform } from "@ionic/angular";
import { Observable, from } from "rxjs";
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
    if (this.platform.is('ios') && this.platform.is('hybrid')) {
      if (document.readyState === 'complete') {
        this.initializeIAP();
      } else {
        document.addEventListener('deviceready', () => this.initializeIAP(), false);
      }
    }
  }

  private getErrorMessage(err: any): string {
    if (err?.message) return err.message;
    return JSON.stringify(err);
  }

  private async initializeIAP(): Promise<void> {
    if (this.iapInitialized) return;
    
    try {
      // Attendre que le store soit disponible
      await new Promise<void>((resolve) => {
        const check = () => {
          if (typeof window.store !== 'undefined' && window.store.validator) {
            resolve();
          } else {
            setTimeout(check, 200);
          }
        };
        check();
      });
  
      window.store.verbosity = window.store.DEBUG;
  
      // Configuration initiale obligatoire
      window.store.register({
        id: "prompteur_1_9",
        type: window.store.PAID_SUBSCRIPTION
      });
  
      // Gestion des erreurs globale
      window.store.error((error: any) => {
        console.error('Store Error:', error);
      });
  
      // Handler d'approbation
      window.store.when("prompteur_1_9").approved((order: any) => {
        this.handleApprovedOrder(order);
      });
  
      // Callback de readiness
      window.store.ready(() => {
        console.log('Store Ready - Products:', window.store.products);
        this.isStoreReady = true;
      });
  
      // Rafraîchissement initial
      window.store.refresh();
      this.iapInitialized = true;
  
    } catch (e) {
      console.error('IAP Initialization Failed:', e);
      // Réessayer après un délai
      setTimeout(() => this.initializeIAP(), 2000);
    }
  }

  private waitForStore(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (typeof window.store !== 'undefined') {
          resolve();
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
  }

  async startApplePurchase(productId: string): Promise<{success: boolean, message?: string}> {
    try {
      if (!this.platform.is('ios')) {
        return {success: false, message: 'iOS only'};
      }

      await this.waitForStoreReady();

      const product = window.store.get(productId);
      if (!product?.loaded) {
        window.store.refresh();
        return {success: false, message: 'Product not loaded'};
      }

      return new Promise((resolve) => {
        const done = (success: boolean, message?: string) => {
          window.store.off(handler);
          resolve({success, message});
        };

        const handler = window.store.when(productId)
          .approved((order: any) => done(true))
          .error((err: any) => done(false, err.message));

        window.store.order(productId);
      });

    } catch (e) {
      return {success: false, message: this.getErrorMessage(e)};
    }
  }

  private waitForStoreReady(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isStoreReady) return resolve();
      
      const check = () => {
        if (this.isStoreReady) {
          resolve();
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
  }

  private handleApprovedOrder(order: any): void {
    const receipt = order?.transaction?.appStoreReceipt;
    if (!receipt) {
      console.error('No receipt found');
      return;
    }

    const userEmail = this.authService.getCurrentUserEmail?.();
    if (!userEmail) {
      console.error('No user email');
      return;
    }

    this.sendReceiptToBackend(receipt, userEmail).subscribe({
      next: () => order.finish(),
      error: (err) => console.error('Receipt validation failed:', err)
    });
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
