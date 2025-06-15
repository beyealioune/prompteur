import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  ios: {
    scheme: 'App'
  },
  plugins: {
    Purchases: {
      apiKey: "appl_obgMsSCvFpwRSAdFHWjEueQNHqK",
      ios: {
        products: [
          {
            id: 'prompteur_1_9',
            type: 'PAID_SUBSCRIPTION'
          }
        ]
      }
    },
    // Ajoutez cette configuration pour votre plugin vidéo
    VideoRecorder: {
      ios: {
        cameraUsageDescription: "Need camera access to record videos",
        microphoneUsageDescription: "Need microphone access to record audio"
      }
    }
  }
};