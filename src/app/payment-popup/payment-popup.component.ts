// src/app/payment-popup/payment-popup.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, Output, EventEmitter } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-payment-popup',
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PaymentPopupComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();

  price: string = '';
  productTitle: string = 'Abonnement Premium';
  isPremium = false;
  loading = false;
  errorMsg = '';

  constructor(
    private payment: PaymentService,
    private ref: ChangeDetectorRef,
    private sessionService : SessionService
  ) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const offerings = await this.payment.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length) {
        this.price = offerings.current.availablePackages[0].product.priceString;
        this.productTitle = offerings.current.availablePackages[0].product.title;
      }
      this.isPremium = await this.payment.checkPremium();
    } catch (e: any) {
      this.errorMsg = e.message || 'Erreur lors de la récupération de l’offre';
    }
    this.loading = false;
    this.ref.detectChanges();
  }

  async buy() {
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.payment.purchase(); // popup native Apple/Google
      this.isPremium = await this.payment.checkPremium();
      if (this.isPremium && this.sessionService.user?.email) {
        this.payment.setPremiumInBackend(this.sessionService.user.email).subscribe({
          next: () => this.sessionService.refreshUser().subscribe(),
          error: err => alert('Erreur de mise à jour premium: ' + err.message)
        });
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled') || e.code === 'PURCHASE_CANCELLED') {
        this.errorMsg = "Achat annulé.";
  
      } else {
        this.errorMsg = e.message || 'Erreur lors de l’achat';
      }
    }
    this.loading = false;
    this.ref.detectChanges();
  }
  
  closePopup() {
    this.closed.emit();
  }
}
