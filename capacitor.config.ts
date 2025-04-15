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
    }
  }
};

export default config;
