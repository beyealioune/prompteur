import Capacitor

@objc(VideoRecorderPlugin)
public class VideoRecorderPlugin: CAPPlugin {
    
    @objc func recordVideo(_ call: CAPPluginCall) {
        print("🎉 plugin utilisé ✅")

        // Simule une réponse pour test
        call.resolve([
            "path": "capacitor://localhost/assets/test-video.mp4"
        ])
    }
}
