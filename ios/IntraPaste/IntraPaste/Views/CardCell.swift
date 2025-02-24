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
                    Image(.note).resizable()
                case "image":
                    Image(.photo).resizable()
                case "video":
                    Image(.video).resizable()
                case "audio":
                    Image(.audio).resizable()
                default:
                    Image(.file).resizable()
                }
            }
            .frame(width: 32, height: 32)
            
            VStack(alignment: .leading, spacing: 4) {
                if card.type == "text" {
                    Text(card.content ?? "")
                        .lineLimit(3)
                        .font(.body)
                } else {
                    Text(card.fileName ?? "Unknown file")
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
                        Label("Copy", systemImage: "doc.on.doc")
                    }
                    
                    Button {
                        showingFullContent = true
                    } label: {
                        Label("View Full Content", systemImage: "doc.text.magnifyingglass")
                    }
                    
                    ShareLink(item: content) {
                        Label("Share", systemImage: "square.and.arrow.up")
                    }
                }
            } else if let filePath = card.filePath {
                Button {
                    downloadFile(from: filePath, fileName: card.fileName ?? "Unknown file")
                } label: {
                    Label("Download", systemImage: "arrow.down.circle")
                }
                
                switch card.type {
                case "image":
                    Button {
                        showingImagePreview = true
                    } label: {
                        Label("Preview", systemImage: "eye")
                    }
                    
                    if let url = URL(string: filePath) {
                        ShareLink(item: url) {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                    }
                    
                case "video" where card.isPlayableVideo:
                    Button {
                        showingVideoPlayer = true
                    } label: {
                        Label("Play", systemImage: "play.circle")
                    }
                    
                    if let url = URL(string: filePath) {
                        ShareLink(item: url) {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                    }
                    
                case "audio" where card.isPlayableAudio:
                    Button {
                        showingAudioPlayer = true
                    } label: {
                        Label("Play", systemImage: "play.circle")
                    }
                    
                    if let url = URL(string: filePath) {
                        ShareLink(item: url) {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                    }
                    
                default:
                    Button {
                        showingFileInfo = true
                    } label: {
                        Label("View Info", systemImage: "info.circle")
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
                Text("Copied")
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
        .alert("File Info", isPresented: $showingFileInfo) {
            if let filePath = card.filePath {
                Button {
                    downloadFile(from: filePath, fileName: card.fileName ?? "Unknown file")
                } label: {
                    HStack {
                        if isDownloading {
                            ProgressView()
                                .scaleEffect(0.8)
                        }
                        Text("Download")
                    }
                }
                .disabled(isDownloading)
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            if let fileName = card.fileName {
                Text("\(fileName)\n\(formatFileSize(card.fileSize ?? 0))")
            }
        }
        .alert("File saved", isPresented: $showingSaveSuccess) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("File saved message")
        }
        .sheet(isPresented: $showingFullContent) {
            NavigationView {
                ScrollView {
                    Text(card.content ?? "")
                        .padding()
                }
                .navigationTitle("Full Content")
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
                        Button("Close") {
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
