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
                    Button("关闭") {
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
            .alert("保存成功", isPresented: $showingSaveSuccess) {
                Button("确定", role: .cancel) { }
            } message: {
                Text("视频已保存到文件。可在手机的`文件`应用中查看。")
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
