import UIKit
import AVFoundation

protocol VideoPrompteurDelegate: AnyObject {
    func didFinishRecordingVideo(url: URL?)
}

class VideoPrompteurViewController: UIViewController, AVCaptureFileOutputRecordingDelegate {

    weak var delegate: VideoPrompteurDelegate?
    var texte: String = ""
    private var captureSession: AVCaptureSession?
    private var movieOutput: AVCaptureMovieFileOutput?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var scrollLabel: UILabel!
    private var timer: Timer?
    private var isRecording = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        setupCamera()
        setupOverlay()
        setupRecordButton()
    }

    func setupCamera() {
        let session = AVCaptureSession()
        session.sessionPreset = .high

        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else {
            delegate?.didFinishRecordingVideo(url: nil)
            return
        }
        session.addInput(input)

        let audioDevice = AVCaptureDevice.default(for: .audio)!
        let audioInput = try! AVCaptureDeviceInput(device: audioDevice)
        session.addInput(audioInput)

        let output = AVCaptureMovieFileOutput()
        if session.canAddOutput(output) { session.addOutput(output) }
        self.movieOutput = output

        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.videoGravity = .resizeAspectFill
        preview.frame = view.bounds
        view.layer.addSublayer(preview)
        self.previewLayer = preview

        session.startRunning()
        self.captureSession = session
    }

    func setupOverlay() {
        scrollLabel = UILabel()
        scrollLabel.text = texte
        scrollLabel.textColor = .white
        scrollLabel.font = UIFont.boldSystemFont(ofSize: 28)
        scrollLabel.backgroundColor = UIColor.black.withAlphaComponent(0.2)
        scrollLabel.numberOfLines = 0
        scrollLabel.textAlignment = .center
        scrollLabel.sizeToFit()

        // Place en bas sur toute la largeur
        let margin: CGFloat = 12
        let labelHeight: CGFloat = 90
        scrollLabel.frame = CGRect(x: margin, y: view.bounds.height - labelHeight - 60, width: view.bounds.width - margin * 2, height: labelHeight)
        view.addSubview(scrollLabel)
    }

    func startScrollingText() {
        // Lancement du scroll vers le haut (style prompteur)
        var frame = scrollLabel.frame
        frame.origin.y = view.bounds.height
        scrollLabel.frame = frame

        timer = Timer.scheduledTimer(withTimeInterval: 0.025, repeats: true) { [weak self] t in
            guard let self = self else { return }
            var frame = self.scrollLabel.frame
            frame.origin.y -= 1 // Vitesse de défilement
            self.scrollLabel.frame = frame
            if frame.origin.y + frame.height < 60 {
                frame.origin.y = self.view.bounds.height
                self.scrollLabel.frame = frame
            }
        }
    }

    func setupRecordButton() {
        let button = UIButton(type: .system)
        button.setTitle("Enregistrer", for: .normal)
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 22)
        button.backgroundColor = .systemRed
        button.tintColor = .white
        button.layer.cornerRadius = 12
        button.frame = CGRect(x: (view.bounds.width - 170)/2, y: view.bounds.height - 52, width: 170, height: 44)
        button.addTarget(self, action: #selector(recordTapped), for: .touchUpInside)
        view.addSubview(button)
    }

    @objc func recordTapped() {
        guard let session = self.captureSession, let movieOutput = self.movieOutput, !isRecording else { return }
        let filePath = NSTemporaryDirectory() + "prompteur.mov"
        let fileUrl = URL(fileURLWithPath: filePath)
        try? FileManager.default.removeItem(at: fileUrl)
        movieOutput.startRecording(to: fileUrl, recordingDelegate: self)
        isRecording = true
        startScrollingText()
        // Change bouton pour "Arrêter"
        if let button = view.subviews.compactMap({ $0 as? UIButton }).first {
            button.setTitle("Arrêter", for: .normal)
            button.backgroundColor = .systemGreen
            button.removeTarget(self, action: #selector(recordTapped), for: .touchUpInside)
            button.addTarget(self, action: #selector(stopTapped), for: .touchUpInside)
        }
    }

    @objc func stopTapped() {
        guard isRecording else { return }
        movieOutput?.stopRecording()
        isRecording = false
        timer?.invalidate()
    }

    func fileOutput(_ output: AVCaptureFileOutput, didFinishRecordingTo outputFileURL: URL, from connections: [AVCaptureConnection], error: Error?) {
        captureSession?.stopRunning()
        timer?.invalidate()
        delegate?.didFinishRecordingVideo(url: outputFileURL)
    }

    override var prefersStatusBarHidden: Bool { true }
}
