import Capacitor
import AVFoundation
import Photos
import MobileCoreServices

@objc(VideoRecorderPlugin)
public class VideoRecorderPlugin: CAPPlugin, UIImagePickerControllerDelegate, UINavigationControllerDelegate {

    var call: CAPPluginCall?
    var picker: UIImagePickerController!

    @objc func recordVideo(_ call: CAPPluginCall) {
        self.call = call

        DispatchQueue.main.async {
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                self.picker = UIImagePickerController()
                self.picker.sourceType = .camera
                self.picker.mediaTypes = [kUTTypeMovie as String]
                self.picker.cameraCaptureMode = .video
                self.picker.videoQuality = .typeHigh
                self.picker.delegate = self
                self.bridge?.viewController?.present(self.picker, animated: true, completion: nil)
            } else {
                call.reject("Camera not available")
            }
        }
    }

    public func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
        picker.dismiss(animated: true, completion: nil)

        guard let mediaURL = info[.mediaURL] as? URL else {
            call?.reject("Failed to get video URL")
            return
        }

        call?.resolve([
            "path": mediaURL.absoluteString
        ])
    }

    public func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true, completion: nil)
        call?.reject("User cancelled")
    }
}
