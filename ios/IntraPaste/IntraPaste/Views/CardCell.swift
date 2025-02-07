import SwiftUI

struct CardCell: View {
    let card: Card
    @State private var isCopied = false
    @State private var showingImagePreview = false
    @State private var showingVideoPlayer = false
    @State private var showingAudioPlayer = false
    @State private var showingFileInfo = false
    @State private var isDownloading = false
    @State private var showingSaveSuccess = false
    @Environment(\.colorScheme) var colorScheme
    @State private var showingFullContent = false
    
    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            Group {
                switch card.type {
                case "text":
                    Image(systemName: "doc.text")
                        .foregroundColor(.blue)
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
            .font(.system(size: 28))
            .frame(width: 32)
            
            VStack(alignment: .leading, spacing: 4) {
                if card.type == "text" {
                    Text(card.content ?? "")
                        .lineLimit(3)
                        .font(.body)
                } else {
                    Text(card.fileName ?? "未知文件")
                        .font(.body)
                        .lineLimit(1)
                }
                
                HStack(spacing: 8) {
                    Text(card.createdAt.formatted())
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    if card.type != "text", let fileSize = card.fileSize {
                        Text("•")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Text(formatFileSize(fileSize))
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
            }
        }
        .padding(.vertical, 2)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .contextMenu {
            if card.type == "text" {
                if let content = card.content {
                    Button {
                        UIPasteboard.general.string = content
                        withAnimation {
                            isCopied = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                            withAnimation {
                                isCopied = false
                            }
                        }
                    } label: {
                        Label("复制", systemImage: "doc.on.doc")
                    }
                    
                    Button {
                        showingFullContent = true
                    } label: {
                        Label("查看完整内容", systemImage: "doc.text.magnifyingglass")
                    }
                    
                    ShareLink(item: content) {
                        Label("分享", systemImage: "square.and.arrow.up")
                    }
                }
            } else if let filePath = card.filePath {
                Button {
                    downloadFile(from: filePath, fileName: card.fileName ?? "未知文件")
                } label: {
                    Label("下载", systemImage: "arrow.down.circle")
                }
                
                switch card.type {
                case "image":
                    Button {
                        showingImagePreview = true
                    } label: {
                        Label("预览", systemImage: "eye")
                    }
                    
                    if let url = URL(string: filePath) {
                        ShareLink(item: url) {
                            Label("分享", systemImage: "square.and.arrow.up")
                        }
                    }
                    
                case "video" where card.isPlayableVideo:
                    Button {
                        showingVideoPlayer = true
                    } label: {
                        Label("播放", systemImage: "play.circle")
                    }
                    
                    if let url = URL(string: filePath) {
                        ShareLink(item: url) {
                            Label("分享", systemImage: "square.and.arrow.up")
                        }
                    }
                    
                case "audio" where card.isPlayableAudio:
                    Button {
                        showingAudioPlayer = true
                    } label: {
                        Label("播放", systemImage: "play.circle")
                    }
                    
                    if let url = URL(string: filePath) {
                        ShareLink(item: url) {
                            Label("分享", systemImage: "square.and.arrow.up")
                        }
                    }
                    
                default:
                    Button {
                        showingFileInfo = true
                    } label: {
                        Label("查看信息", systemImage: "info.circle")
                    }
                }
            }
        }
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
                Button {
                    downloadFile(from: filePath, fileName: card.fileName ?? "未知文件")
                } label: {
                    HStack {
                        if isDownloading {
                            ProgressView()
                                .scaleEffect(0.8)
                        }
                        Text("下载")
                    }
                }
                .disabled(isDownloading)
            }
            Button("取消", role: .cancel) { }
        } message: {
            if let fileName = card.fileName {
                Text("文件名：\(fileName)\n大小：\(formatFileSize(card.fileSize ?? 0))")
            }
        }
        .alert("保存成功", isPresented: $showingSaveSuccess) {
            Button("确定", role: .cancel) { }
        } message: {
            Text("文件已保存。可在手机的`文件`应用中查看。")
        }
        .sheet(isPresented: $showingFullContent) {
            NavigationView {
                ScrollView {
                    Text(card.content ?? "")
                        .padding()
                }
                .navigationTitle("完整内容")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button {
                            if let content = card.content {
                                UIPasteboard.general.string = content
                            }
                        } label: {
                            Image(systemName: "doc.on.doc")
                        }
                    }
                    
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("关闭") {
                            showingFullContent = false
                        }
                    }
                }
            }
        }
    }
    
    private func formatFileSize(_ bytes: Int) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useAll]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(bytes))
    }
    
    private func downloadFile(from urlString: String, fileName: String) {
        isDownloading = true
        
        FileDownloader.shared.downloadFile(from: urlString, fileName: fileName) { result in
            DispatchQueue.main.async {
                isDownloading = false
                
                switch result {
                case .success:
                    showingSaveSuccess = true
                case .failure(let error):
                    print("File save error:", error)
                }
            }
        }
    }
}
