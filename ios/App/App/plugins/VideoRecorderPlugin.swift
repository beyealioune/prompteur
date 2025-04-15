import Capacitor
import Foundation
import UIKit
import MobileCoreServices
import AVFoundation

@objc(VideoRecorderPlugin)
public class VideoRecorderPlugin: CAPPlugin, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    var call: CAPPluginCall?

    @objc func recordVideo(_ call: CAPPluginCall) {
        self.call = call

        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                if !granted {
                    call.reject("Autorisation caméra refusée")
                    return
                }

                let picker = UIImagePickerController()
                picker.sourceType = .camera
                picker.mediaTypes = [kUTTypeMovie as String]
                picker.videoQuality = .typeHigh
                picker.cameraDevice = .front
                picker.delegate = self

                self.bridge?.viewController?.present(picker, animated: true, completion: nil)
            }
        }
    }

    public func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true, completion: nil)

        guard let mediaURL = info[.mediaURL] as? URL else {
            self.call?.reject("Impossible d'obtenir l'URL de la vidéo")
            return
        }

        self.call?.resolve([
            "path": mediaURL.absoluteString
        ])
    }

    public func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true, completion: nil)
        self.call?.reject("Enregistrement annulé par l'utilisateur")
    }
}
