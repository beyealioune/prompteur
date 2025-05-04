declare module 'cordova-plugin-purchase' {
    const store: {
      DEBUG: number;
      PAID_SUBSCRIPTION: string;
      register(product: { id: string; type: string }): void;
      when(productId: string): any;
      ready(callback: () => void): void;
      refresh(): void;
      order(productId: string): void;
      get(productId: string): any;
      verbosity: number;
      error(callback: (error: any) => void): void;
    };
  }