const config = {
  appId: 'com.aliapp.prompteur',
  appName: 'PrompteurApp',
  webDir: 'dist/prompteur/browser',
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      cameraPermission: "Cette application a besoin d'accéder à votre caméra",
      microphonePermission: "Cette application a besoin d'accéder à votre micro"
    }
  }
};

export default config;