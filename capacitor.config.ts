import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  plugins: {
    Camera: {
      cameraPermission: 'Nécessite l\'accès à la caméra',
      microphonePermission: 'Nécessite l\'accès au micro'
    },
    VideoRecorder: {
      microphonePermission: 'Nécessite l\'accès au micro'
    },
    Purchase: {
      ios: {
        products: [
          {
            id: 'prompteur_1_9',
            type: 'PAID_SUBSCRIPTION',
            group: 'premium_subscriptions'
          }
        ],
        autoFinishTransactions: true
      },
      android: {
        licenseKey: 'VOTRE_CLE_GOOGLE_PLAY'
      }
    },
    PushNotifications: {
      presentationOptions: ['alert', 'sound']
    }
  },
  ios: {
    scheme: 'App',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'alias_name'
    }
  }
};

export default config;