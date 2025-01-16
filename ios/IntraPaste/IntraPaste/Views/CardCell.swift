import SwiftUI

struct CardCell: View {
    let card: Card
    @State private var isCopied = false
    @State private var showingImagePreview = false
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                if card.type == "image" {
                    if let filePath = card.filePath {
                        AsyncImage(url: URL(string: filePath)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 150)
                                .clipped()
                                .cornerRadius(8)
                        } placeholder: {
                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: 150)
                                .cornerRadius(8)
                        }
                        .onTapGesture {
                            showingImagePreview = true
                        }
                        
                        HStack {
                            if let fileName = card.fileName {
                                Text(fileName)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                            
                            if let fileSize = card.fileSize {
                                Text("(\(formatFileSize(fileSize)))")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                } else {
                    Text(card.content ?? "")
                        .lineLimit(3)
                        .truncationMode(.tail)
                }
                
                Text(card.createdAt.formatted())
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            Spacer()
        }
        .contentShape(Rectangle())
        .onTapGesture {
            if card.type == "text" {
                UIPasteboard.general.string = card.content
                withAnimation {
                    isCopied = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    withAnimation {
                        isCopied = false
                    }
                }
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