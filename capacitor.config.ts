import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  plugins: {
    Camera: {
      cameraPermission: 'Cette application nécessite l\'accès à la caméra',
      microphonePermission: 'Cette application nécessite l\'accès au micro'
    }
  }
};
