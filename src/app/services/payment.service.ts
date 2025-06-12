import { Injectable } from '@angular/core';
import { Purchases, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private isConfigured = false;

  constructor() {
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
    try {
      return await Purchases.getOfferings();
    } catch (error) {
      console.error('Error getting offerings', error);
      throw error;
    }
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
      // purchaseResult est { customerInfo: CustomerInfo }
      return this.hasPremiumAccess(purchaseResult.customerInfo);
    } catch (error) {
      console.error('Purchase error', error);
      throw error;
    }
  }

  async checkPremium(): Promise<boolean> {
    try {
      const result = await Purchases.getCustomerInfo();
      // result est { customerInfo: CustomerInfo }
      return this.hasPremiumAccess(result.customerInfo);
    } catch (error) {
      console.error('Error checking premium status', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const result = await Purchases.restorePurchases();
      // result est { customerInfo: CustomerInfo }
      return this.hasPremiumAccess(result.customerInfo);
    } catch (error) {
      console.error('Error restoring purchases', error);
      throw error;
    }
  }

  private hasPremiumAccess(customerInfo: CustomerInfo): boolean {
    // Vérifie si "premium" est actif dans les entitlements OU s'il y a un abonnement actif
    return (
      customerInfo.entitlements?.active?.['premium']?.isActive === true ||
      (customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0)
    );
  }
}
