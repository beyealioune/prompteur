import UIKit
import Capacitor
import WebKit

class MainViewController: CAPViewController {

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        self.webView = WKWebView(frame: .zero, configuration: config)
        super.loadView()
    }
}
