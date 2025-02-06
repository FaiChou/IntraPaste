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
                    Button("关闭") {
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
            .alert("保存成功", isPresented: $showingSaveSuccess) {
                Button("确定", role: .cancel) { }
            } message: {
                Text("音频已保存到文件")
            }
            .onAppear {
                if let url = URL(string: audioURL) {
                    audioPlayer.setupPlayer(with: url)
                }
            }
        }
    }
    
    private func downloadAudio() {
        guard let url = URL(string: audioURL) else { return }
        
        isDownloading = true
        
        let task = URLSession.shared.downloadTask(with: url) { localURL, _, error in
            defer {
                DispatchQueue.main.async {
                    isDownloading = false
                }
            }
            
            guard let localURL = localURL, error == nil else {
                print("Download error:", error ?? "unknown error")
                return
            }
            
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let destinationURL = documentsPath.appendingPathComponent(fileName)
            
            do {
                if FileManager.default.fileExists(atPath: destinationURL.path) {
                    try FileManager.default.removeItem(at: destinationURL)
                }
                try FileManager.default.copyItem(at: localURL, to: destinationURL)
                
                DispatchQueue.main.async {
                    showingSaveSuccess = true
                }
            } catch {
                print("File save error:", error)
            }
        }
        task.resume()
    }
}

class AudioPlayerManager: ObservableObject {
    private var player: AVPlayer?
    @Published var isPlaying = false
    
    func setupPlayer(with url: URL) {
        let playerItem = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: playerItem)
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
}
