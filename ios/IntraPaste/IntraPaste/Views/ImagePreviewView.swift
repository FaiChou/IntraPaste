import SwiftUI

struct ImagePreviewView: View {
    let imageURL: String
    let fileName: String
    @Environment(\.dismiss) private var dismiss
    @State private var isDownloading = false
    @State private var downloadProgress: Float = 0
    
    var body: some View {
        NavigationView {
            GeometryReader { geometry in
                AsyncImage(url: URL(string: imageURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: geometry.size.width)
                } placeholder: {
                    ProgressView()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("关闭") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        downloadImage()
                    } label: {
                        if isDownloading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Image(systemName: "square.and.arrow.down")
                        }
                    }
                    .disabled(isDownloading)
                }
            }
        }
    }
    
    private func downloadImage() {
        guard let url = URL(string: imageURL) else { return }
        
        isDownloading = true
        
        let task = URLSession.shared.downloadTask(with: url) { localURL, response, error in
            if let error = error {
                print("Download error:", error)
                return
            }
            
            guard let localURL = localURL else { return }
            
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let destinationURL = documentsPath.appendingPathComponent(fileName)
            
            do {
                try? FileManager.default.removeItem(at: destinationURL)
                try FileManager.default.copyItem(at: localURL, to: destinationURL)
                
                DispatchQueue.main.async {
                    isDownloading = false
                    UIApplication.shared.open(destinationURL)
                }
            } catch {
                print("File error:", error)
                DispatchQueue.main.async {
                    isDownloading = false
                }
            }
        }
        
        task.resume()
    }
} 