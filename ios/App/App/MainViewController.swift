import UIKit
import Capacitor
import WebKit

class MainViewController: CAPViewController {

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
    print("✅ MainViewController chargé avec lecture inline activée")

        self.webView = WKWebView(frame: .zero, configuration: config)
        super.loadView()
    }
}
