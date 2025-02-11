import SwiftUI
import AVKit

struct AudioPlayerView: View {
    let audioURL: String
    let fileName: String
    @Environment(\.dismiss) private var dismiss
    @StateObject private var audioPlayer = AudioPlayerManager()
    @State private var isDownloading = false
    @State private var showingSaveSuccess = false
    
    var body: some View {
        NavigationView {
            VStack {
                Spacer()
                
                VStack(spacing: 20) {
                    Image(systemName: "music.note")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    
                    Text(fileName)
                        .font(.headline)
                    
                    VStack(spacing: 8) {
                        Slider(value: $audioPlayer.progress, in: 0...1) { editing in
                            if editing {
                                audioPlayer.isSeeking = true
                            } else {
                                audioPlayer.seekToProgress()
                            }
                        }
                        
                        HStack {
                            Text(audioPlayer.currentTimeString)
                                .font(.caption)
                            Spacer()
                            Text(audioPlayer.durationString)
                                .font(.caption)
                        }
                        .foregroundColor(.gray)
                    }
                    .padding(.horizontal)
                    
                    HStack {
                        Button {
                            audioPlayer.isPlaying ? audioPlayer.pause() : audioPlayer.play()
                        } label: {
                            Image(systemName: audioPlayer.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                                .font(.system(size: 44))
                        }
                    }
                }
                
                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        audioPlayer.stop()
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        downloadAudio()
                    } label: {
                        if isDownloading {
                            ProgressView()
                        } else {
                            Image(systemName: "square.and.arrow.down")
                        }
                    }
                    .disabled(isDownloading)
                }
            }
            .alert("Save Successful", isPresented: $showingSaveSuccess) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Audio has been saved to Files. You can view it in the Files app.")
            }
            .onAppear {
                AudioSessionManager.shared.configureAudioSession()
                if let url = URL(string: audioURL) {
                    audioPlayer.setupPlayer(with: url)
                }
            }
        }
    }
    
    private func downloadAudio() {
        isDownloading = true
        
        FileDownloader.shared.downloadFile(from: audioURL, fileName: fileName) { result in
            DispatchQueue.main.async {
                isDownloading = false
                
                switch result {
                case .success:
                    showingSaveSuccess = true
                case .failure(let error):
                    print("Audio save error:", error)
                }
            }
        }
    }
}

class AudioPlayerManager: ObservableObject {
    private var player: AVPlayer?
    @Published var isPlaying = false
    @Published var progress: Double = 0
    @Published var currentTimeString: String = "00:00"
    @Published var durationString: String = "00:00"
    private var timeObserver: Any?
    var isSeeking = false
    
    func setupPlayer(with url: URL) {
        let playerItem = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: playerItem)
        
        timeObserver = player?.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.1, preferredTimescale: 600), queue: .main) { [weak self] time in
            guard let self = self, !self.isSeeking else { return }
            
            if let duration = self.player?.currentItem?.duration.seconds, duration.isFinite {
                self.progress = time.seconds / duration
                self.currentTimeString = self.formatTime(time.seconds)
                self.durationString = self.formatTime(duration)
            }
        }
    }
    
    func play() {
        player?.play()
        isPlaying = true
    }
    
    func pause() {
        player?.pause()
        isPlaying = false
    }
    
    func stop() {
        player?.pause()
        player?.seek(to: .zero)
        isPlaying = false
    }
    
    func seekToProgress() {
        guard let player = player, let duration = player.currentItem?.duration else { return }
        isSeeking = false
        let time = CMTime(seconds: duration.seconds * progress, preferredTimescale: 600)
        player.seek(to: time)
    }
    
    private func formatTime(_ timeInSeconds: Double) -> String {
        let minutes = Int(timeInSeconds / 60)
        let seconds = Int(timeInSeconds.truncatingRemainder(dividingBy: 60))
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    deinit {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
        }
    }
}
