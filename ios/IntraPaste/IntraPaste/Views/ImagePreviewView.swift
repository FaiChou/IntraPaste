import SwiftUI

struct ImagePreviewView: View {
    let imageURL: String
    let fileName: String
    @Environment(\.dismiss) private var dismiss
    @State private var isDownloading = false
    @State private var downloadProgress: Float = 0
    @State private var showingSaveSuccess = false
    @State private var hasDownloaded = false
    
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
                    Button("Close") {
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
                    .disabled(isDownloading || hasDownloaded)
                }
            }
            .alert("Save Successful", isPresented: $showingSaveSuccess) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Image has been saved to Photos")
            }
        }
    }
    
    private func downloadImage() {
        guard let url = URL(string: imageURL) else { return }
        
        isDownloading = true
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            defer {
                DispatchQueue.main.async {
                    isDownloading = false
                }
            }
            
            if let error = error {
                print("Download error:", error)
                return
            }
            
            guard let data = data,
                  let image = UIImage(data: data) else { return }
            
            UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
            
            DispatchQueue.main.async {
                hasDownloaded = true
                showingSaveSuccess = true
            }
            
        }.resume()
    }
}
