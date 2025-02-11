import SwiftUI
import AVKit
import Photos

struct VideoPlayerView: View {
    let videoURL: String
    let fileName: String
    @Environment(\.dismiss) private var dismiss
    @State private var player: AVPlayer?
    @State private var isDownloading = false
    @State private var showingSaveSuccess = false
    
    var body: some View {
        NavigationView {
            Group {
                if let player = player {
                    VideoPlayer(player: player)
                        .ignoresSafeArea()
                } else {
                    ProgressView()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        player?.pause()
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        downloadVideo()
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
            .alert("Video saved", isPresented: $showingSaveSuccess) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Video has been saved to Files. You can view it in the Files app.")
            }
            .onAppear {
                AudioSessionManager.shared.configureAudioSession()
                if let url = URL(string: videoURL) {
                    player = AVPlayer(url: url)
                    player?.play()
                }
            }
        }
    }
    
    private func downloadVideo() {
        isDownloading = true
        
        FileDownloader.shared.downloadFile(from: videoURL, fileName: fileName) { result in
            DispatchQueue.main.async {
                isDownloading = false
                switch result {
                case .success:
                    showingSaveSuccess = true
                case .failure(let error):
                    print("Video save error:", error)
                }
            }
        }
    }
}
