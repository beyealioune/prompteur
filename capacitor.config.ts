const config = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser', // ✅ c’est bien ici ton index.html
  plugins: {
    Camera: {
      cameraPermission: 'Cette application nécessite l\'accès à la caméra',
      microphonePermission: 'Cette application nécessite l\'accès au micro'
    }
  }
};

export default config;
