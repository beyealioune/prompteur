import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  ios: {
    scheme: 'App'
  },
  plugins: {
    Purchase: {
      ios: {
        products: [
          {
            id: 'prompteur_1_9',
            type: 'PAID_SUBSCRIPTION'
          }
        ]
      }
    }
  }
};

export default config;