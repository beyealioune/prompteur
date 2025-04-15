import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // ✅ Enregistrement manuel du plugin
        bridge?.registerPlugin(VideoRecorderPlugin.self)

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Gestion interruption temporaire (ex : appel entrant)
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Gestion passage arrière-plan
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Gestion retour au premier plan
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Reprise des tâches après inactivité
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Sauvegarde avant fermeture
    }

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
