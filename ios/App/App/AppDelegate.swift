import UIKit
import Capacitor
import StoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var backgroundSnapshotView: UIView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Configuration initiale
        self.window = UIWindow(frame: UIScreen.main.bounds)
        
        // Configuration des achats in-app
        SKPaymentQueue.default().add(StoreObserver.shared)
        
        // Prévention des écrans noirs au lancement
        if #available(iOS 13.0, *) {
            // Géré par SceneDelegate
        } else {
            let controller = UIViewController()
            controller.view.backgroundColor = .white
            self.window?.rootViewController = controller
            self.window?.makeKeyAndVisible()
        }
        
        return true
    }

    // MARK: - Gestion des snapshots et écrans noirs
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Créer un faux snapshot pour éviter l'écran noir
        guard let window = self.window else { return }
        
        backgroundSnapshotView = UIView(frame: window.bounds)
        backgroundSnapshotView?.backgroundColor = .white
        window.addSubview(backgroundSnapshotView!)
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Retirer le faux snapshot
        backgroundSnapshotView?.removeFromSuperview()
        backgroundSnapshotView = nil
    }

    // MARK: - UISceneSession Lifecycle (iOS 13+)
    
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }

    // ... (conservez les autres méthodes existantes)
}

@available(iOS 13.0, *)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    var backgroundSnapshotView: UIView?
    
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        let window = UIWindow(windowScene: windowScene)
        window.backgroundColor = .white
        self.window = window
        window.makeKeyAndVisible()
    }
    
    func sceneWillResignActive(_ scene: UIScene) {
        guard let window = self.window else { return }
        
        backgroundSnapshotView = UIView(frame: window.bounds)
        backgroundSnapshotView?.backgroundColor = .white
        window.addSubview(backgroundSnapshotView!)
    }
    
    func sceneDidBecomeActive(_ scene: UIScene) {
        backgroundSnapshotView?.removeFromSuperview()
        backgroundSnapshotView = nil
    }
}

// Helper pour les achats in-app
class StoreObserver: NSObject, SKPaymentTransactionObserver {
    static let shared = StoreObserver()
    
    private override init() {
        super.init()
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchasing:
                print("Transaction en cours")
            case .purchased, .restored:
                print("Transaction réussie")
                queue.finishTransaction(transaction)
                
                // Envoyer le reçu au serveur
                if let receiptURL = Bundle.main.appStoreReceiptURL,
                   let receiptData = try? Data(contentsOf: receiptURL) {
                    let receiptString = receiptData.base64EncodedString()
                    NotificationCenter.default.post(name: .iapTransactionCompleted,
                                                  object: nil,
                                                  userInfo: ["receipt": receiptString])
                }
                
            case .failed:
                print("Transaction échouée: \(transaction.error?.localizedDescription ?? "")")
                queue.finishTransaction(transaction)
            case .deferred:
                print("Transaction différée")
            @unknown default:
                break
            }
        }
    }
}

extension Notification.Name {
    static let iapTransactionCompleted = Notification.Name("iapTransactionCompleted")
}
