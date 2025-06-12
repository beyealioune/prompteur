import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  ios: {
    scheme: 'App'
  },
  plugins: {
    // Correction: Le nom du plugin doit être "Purchases" (avec un 's')
    Purchases: {
      apiKey: "appl_obgMsSCvFpwRSAdFHWjEueQNHqK", // Ajoutez votre clé API ici
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