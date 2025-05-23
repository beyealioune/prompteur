import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  plugins: {
    Camera: {
      cameraPermission: 'Nécessite l\'accès à la caméra',
      microphonePermission: 'Nécessite l\'accès au micro'
    },
    VideoRecorder: {
      microphonePermission: 'Nécessite l\'accès au micro'
    },
    // Ajoutez la configuration pour les achats in-app
    Purchase: {
      ios: {
        products: [
          {
            id: 'prompteur_1_9',
            type: 'PAID_SUBSCRIPTION' // ou 'CONSUMABLE'/'NON_CONSUMABLE' selon le type
          }
        ]
      },
      android: {
        // Configuration Android si nécessaire
      }
    }
  },
  // Optionnel: Configuration iOS supplémentaire
  ios: {
    scheme: 'App',
    preferredContentMode: 'mobile',
    cordovaLinkerFlags: ['-ObjC']
  }
};

export default config;