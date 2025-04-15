import Capacitor

@objc(VideoRecorderPlugin)
public class VideoRecorderPlugin: CAPPlugin {

    @objc func recordVideo(_ call: CAPPluginCall) {
        print("🎉 plugin utilisé ✅")  // ← Ton test de log
        call.resolve([
            "path": "capacitor://localhost/assets/test-video.mp4"
        ])
    }
}
