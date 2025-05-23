import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialisation de l'application
        return true
    }

    // MARK: - UISceneSession Lifecycle (iOS 13+)
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    @available(iOS 13.0, *)
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
    }

    // MARK: - Lifecycle Methods
    func applicationWillResignActive(_ application: UIApplication) {
        // Pause des tâches en cours
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Sauvegarde de l'état
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Préparation retour au premier plan
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Redémarrage des tâches
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Sauvegarde avant terminaison
    }

    // MARK: - URL Handling
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - In-App Purchase Setup
    func setupInAppPurchases() {
        // Configuration initiale des achats intégrés
        // Cette méthode devrait être appelée dans didFinishLaunchingWithOptions
    }
}
