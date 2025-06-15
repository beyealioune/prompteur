import Capacitor
import UIKit
import AVFoundation

@objc(VideoRecorderPlugin)
public class VideoRecorderPlugin: CAPPlugin, VideoPrompteurDelegate {

    var call: CAPPluginCall?

    @objc func recordVideo(_ call: CAPPluginCall) {
        self.call = call
        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                if !granted {
                    call.reject("Autorisation caméra refusée")
                    return
                }

                let texte = call.getString("texte") ?? "Bienvenue sur le prompteur"
                let prompteurVC = VideoPrompteurViewController()
                prompteurVC.texte = texte
                prompteurVC.delegate = self
                prompteurVC.modalPresentationStyle = .fullScreen
                self.bridge?.viewController?.present(prompteurVC, animated: true, completion: nil)
            }
        }
    }

    // Delegate quand la vidéo est finie
    func didFinishRecordingVideo(url: URL?) {
        self.bridge?.viewController?.dismiss(animated: true, completion: nil)
        if let url = url {
            self.call?.resolve(["path": url.absoluteString])
        } else {
            self.call?.reject("Erreur lors de l'enregistrement vidéo")
        }
    }
}
