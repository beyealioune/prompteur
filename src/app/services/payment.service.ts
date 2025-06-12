import { Injectable } from '@angular/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  async getOfferings() {
    return await Purchases.getOfferings();
  }

  async purchase() {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current || offerings.current.availablePackages.length === 0) {
      throw new Error("Aucune offre disponible.");
    }
    const packageToBuy = offerings.current.availablePackages[0];
    // ⚠️ On passe l'objet package et non juste un id
    return await Purchases.purchasePackage({ aPackage: packageToBuy });
  }

  async checkPremium() {
    const result = await Purchases.getCustomerInfo();
    // On accède à .customerInfo.activeSubscriptions
    return result.customerInfo.activeSubscriptions.length > 0;
  }

  async restore() {
    return await Purchases.restorePurchases();
  }
}
