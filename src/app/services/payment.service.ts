// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { Purchases, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private isConfigured = false;

  constructor(private http: HttpClient) {
    this.initializePurchases();
  }

  private async initializePurchases() {
    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: "appl_obgMsSCvFpwRSAdFHWjEueQNHqK"
      });
      this.isConfigured = true;
      console.log('✅ RevenueCat initialized');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed', error);
    }
  }

  async getOfferings() {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not initialized yet');
    }
    return await Purchases.getOfferings();
  }

  async purchase(): Promise<boolean> {
    try {
      const offerings = await this.getOfferings();
      if (!offerings.current || offerings.current.availablePackages.length === 0) {
        throw new Error("No available packages");
      }
      const purchaseResult = await Purchases.purchasePackage({
        aPackage: offerings.current.availablePackages[0]
      });
      return this.hasPremiumAccess(purchaseResult.customerInfo);
    } catch (error) {
      throw error;
    }
  }

  async checkPremium(): Promise<boolean> {
    try {
      const result = await Purchases.getCustomerInfo();
      return this.hasPremiumAccess(result.customerInfo);
    } catch (error) {
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const result = await Purchases.restorePurchases();
      return this.hasPremiumAccess(result.customerInfo);
    } catch (error) {
      throw error;
    }
  }

  private hasPremiumAccess(customerInfo: CustomerInfo): boolean {
    return (
      customerInfo.entitlements?.active?.['premium']?.isActive === true ||
      (customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0)
    );
  }

  setPremiumInBackend(email: string) {
    return this.http.post(`${environment.apiUrl}users/set-premium`, { email });
  }
  setTrialInBackend(email: string, days: number = 3) {
    return this.http.post(`${environment.apiUrl}users/set-trial`, { email, days });
  }
}
