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
                Text("视频已保存到相册")
            }
            .onAppear {
                if let url = URL(string: videoURL) {
                    player = AVPlayer(url: url)
                    player?.play()
                }
            }
        }
    }
    
    private func downloadVideo() {
        guard let url = URL(string: videoURL) else { return }
        
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
            
            PHPhotoLibrary.requestAuthorization { status in
                guard status == .authorized else { return }
                
                PHPhotoLibrary.shared().performChanges {
                    let request = PHAssetCreationRequest.forAsset()
                    request.addResource(with: .video, fileURL: localURL, options: nil)
                } completionHandler: { success, error in
                    DispatchQueue.main.async {
                        if success {
                            showingSaveSuccess = true
                        }
                    }
                }
            }
        }
        task.resume()
    }
}
