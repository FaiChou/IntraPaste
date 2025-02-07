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
                Text("音频已保存到文件。可在手机的`文件`应用中查看。")
            }
            .onAppear {
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
