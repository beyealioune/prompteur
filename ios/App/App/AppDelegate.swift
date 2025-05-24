import UIKit
import Capacitor
import StoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Initialisation des achats in-app au lancement
        SKPaymentQueue.default().add(StoreObserver.shared)
        
        return true
    }

    // MARK: UISceneSession Lifecycle (nécessaire pour iOS 13+)
    @available(iOS 13.0, *)
    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    @available(iOS 13.0, *)
    func application(_ application: UIApplication,
                     didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
    }

    // MARK: Lifecycle de l'application
    func applicationWillResignActive(_ application: UIApplication) {
        // Pause des tâches en cours
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Sauvegarde de l'état
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Préparation retour au premier plan
        SKPaymentQueue.default().add(StoreObserver.shared)
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Redémarrage des tâches
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Nettoyage avant terminaison
        SKPaymentQueue.default().remove(StoreObserver.shared)
    }

    // MARK: Gestion des URLs
    func application(_ app: UIApplication,
                     open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
                     continue userActivity: NSUserActivity,
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application,
                                                         continue: userActivity,
                                                         restorationHandler: restorationHandler)
    }
}

// Helper pour les achats in-app
class StoreObserver: NSObject, SKPaymentTransactionObserver {
    static let shared = StoreObserver()
    
    private override init() {
        super.init()
    }
    
    func paymentQueue(_ queue: SKPaymentQueue,
                      updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchasing:
                print("Transaction en cours")
            case .purchased, .restored:
                print("Transaction réussie")
                queue.finishTransaction(transaction)
            case .failed:
                print("Transaction échouée")
                queue.finishTransaction(transaction)
            case .deferred:
                print("Transaction différée")
            @unknown default:
                break
            }
        }
    }
    
    func paymentQueue(_ queue: SKPaymentQueue,
                      shouldAddStorePayment payment: SKPayment,
                      for product: SKProduct) -> Bool {
        return true
    }
}
