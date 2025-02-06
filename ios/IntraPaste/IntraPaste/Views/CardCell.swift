import SwiftUI

struct CardCell: View {
    let card: Card
    @State private var isCopied = false
    @State private var showingImagePreview = false
    @State private var showingVideoPlayer = false
    @State private var showingAudioPlayer = false
    @State private var showingFileInfo = false
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if card.type == "text" {
                Text(card.content ?? "")
                    .lineLimit(3)
            } else {
                HStack {
                    Group {
                        switch card.type {
                        case "image":
                            Image(systemName: "photo")
                                .foregroundColor(.blue)
                        case "video":
                            Image(systemName: "video")
                                .foregroundColor(.red)
                        case "audio":
                            Image(systemName: "music.note")
                                .foregroundColor(.purple)
                        default:
                            Image(systemName: "doc")
                                .foregroundColor(.gray)
                        }
                    }
                    .font(.title2)
                    
                    VStack(alignment: .leading) {
                        Text(card.fileName ?? "未知文件")
                            .font(.subheadline)
                            .lineLimit(1)
                        
                        if let fileSize = card.fileSize {
                            Text(formatFileSize(fileSize))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
            }
            
            Text(card.createdAt.formatted())
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
        .onTapGesture {
            switch card.type {
            case "text":
                if let content = card.content {
                    UIPasteboard.general.string = content
                    withAnimation {
                        isCopied = true
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        withAnimation {
                            isCopied = false
                        }
                    }
                }
            case "image":
                showingImagePreview = true
            case "video" where card.isPlayableVideo:
                showingVideoPlayer = true
            case "audio" where card.isPlayableAudio:
                showingAudioPlayer = true
            default:
                showingFileInfo = true
            }
        }
        .overlay(alignment: .trailing) {
            if isCopied {
                Text("已复制")
                    .font(.caption)
                    .foregroundColor(.green)
                    .padding(.horizontal)
            }
        }
        .sheet(isPresented: $showingImagePreview) {
            if let filePath = card.filePath {
                ImagePreviewView(imageURL: filePath, fileName: card.fileName ?? "image.jpg")
            }
        }
        .sheet(isPresented: $showingVideoPlayer) {
            if let filePath = card.filePath {
                VideoPlayerView(videoURL: filePath, fileName: card.fileName ?? "video.mp4")
            }
        }
        .sheet(isPresented: $showingAudioPlayer) {
            if let filePath = card.filePath {
                AudioPlayerView(audioURL: filePath, fileName: card.fileName ?? "audio.mp3")
            }
        }
        .alert("文件信息", isPresented: $showingFileInfo) {
            if let filePath = card.filePath {
                Button("下载") {
                    UIApplication.shared.open(URL(string: filePath)!)
                }
            }
            Button("取消", role: .cancel) { }
        } message: {
            if let fileName = card.fileName {
                Text("文件名：\(fileName)\n大小：\(formatFileSize(card.fileSize ?? 0))")
            }
        }
    }
    
    private func formatFileSize(_ bytes: Int) -> String {
        if bytes < 1024 {
            return "\(bytes) B"
        } else if bytes < 1024 * 1024 {
            return String(format: "%.2f KB", Double(bytes) / 1024)
        } else {
            return String(format: "%.2f MB", Double(bytes) / (1024 * 1024))
        }
    }
}
