import SwiftUI
import PhotosUI

struct CardListView: View {
    let server: Server
    @EnvironmentObject var serverManager: ServerManager
    @State private var cards: [Card] = []
    @State private var newContent = ""
    @State private var isLoading = false
    @State private var error: String?
    @State private var minioEnabled = false
    @State private var showingDocumentPicker = false
    @State private var selectedDocument: URL?
    @State private var showingImagePicker = false
    @State private var selectedImage: UIImage?
    @State private var buttonWidth: CGFloat = 0
    @State private var showingCamera = false
    var body: some View {
        VStack {
            ZStack {
                List {
                    ForEach(cards) { card in
                        CardCell(card: card)
                    }
                }
                .refreshable {
                    await refreshCards()
                }
                if isLoading && cards.isEmpty {
                    VStack {
                        ProgressView()
                        Spacer()
                    }
                }
            }
            .simultaneousGesture(
                TapGesture().onEnded {
                    dismissKeyboard()
                }
            )
            InputBar(
                text: $newContent,
                showingCamera: $showingCamera,
                showingImagePicker: $showingImagePicker,
                showingDocumentPicker: $showingDocumentPicker,
                minioEnabled: minioEnabled,
                onSend: createNewCard
            )
        }
        .background(.clear)
        .navigationTitle(server.name)
        .toolbarRole(.editor)
        .sheet(isPresented: $showingDocumentPicker) {
            DocumentPicker(url: $selectedDocument)
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(selectedImage: $selectedImage)
        }
        .fullScreenCover(isPresented: $showingCamera) {
            CameraPicker(selectedImage: $selectedImage)
                .edgesIgnoringSafeArea(.all)
        }
        .onAppear {
            if cards.isEmpty {
                fetchCards()
            }
            checkMinioStatus()
        }
        .alert("Error", isPresented: .constant(error != nil)) {
            Button("OK") { error = nil }
        } message: {
            if let error = error {
                Text(error)
            }
        }
        .onChange(of: selectedDocument) { newValue in
            guard let fileURL = newValue else { return }
            Task {
                do {
                    let fileData = try Data(contentsOf: fileURL)
                    let fileName = fileURL.lastPathComponent
                    _ = try await APIClient.shared.uploadFile(
                        fileData: fileData,
                        fileName: fileName,
                        fileType: .document,
                        server: server
                    )
                    selectedDocument = nil
                    await refreshCards()
                } catch {
                    self.error = "Upload failed"
                }
            }
        }
        .onChange(of: selectedImage) { newImage in
            guard let image = newImage,
                  let imageData = image.jpegData(compressionQuality: 0.8) else { return }
            
            Task {
                do {
                    _ = try await APIClient.shared.uploadFile(
                        fileData: imageData,
                        fileName: "\(Date().timeIntervalSince1970).jpg",
                        fileType: .image,
                        server: server
                    )
                    selectedImage = nil
                    await refreshCards()
                } catch {
                    self.error = "Upload failed"
                }
            }
        }
    }
    
    @MainActor
    private func fetchCards() {
        isLoading = true
        Task {
            do {
                cards = try await APIClient.shared.fetchCards(from: server)
                isLoading = false
            } catch {
                print(error)
                self.error = "Failed to get cards"
                isLoading = false
            }
        }
    }
    
    @MainActor
    private func createNewCard() {
        guard !newContent.isEmpty else { return }
        
        Task {
            do {
                _ = try await APIClient.shared.createCard(content: newContent, server: server)
                newContent = ""
                fetchCards()
                dismissKeyboard()
            } catch {
                self.error = "Failed to create card"
            }
        }
    }
    
    @MainActor
    private func refreshCards() async {
        do {
            let refreshedCards = try await APIClient.shared.fetchCards(from: server)
            cards = refreshedCards
        } catch {
            self.error = "Refresh failed"
        }
    }
    
    private func dismissKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder),
                                      to: nil, from: nil, for: nil)
    }
    
    @MainActor
    private func checkMinioStatus() {
        Task {
            do {
                minioEnabled = try await APIClient.shared.checkMinioStatus(server: server)
            } catch {
                minioEnabled = false
                print("Failed to check MinIO status:", error)
            }
        }
    }
}

struct DocumentPicker: UIViewControllerRepresentable {
    @Binding var url: URL?
    
    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.data], asCopy: true)
        picker.delegate = context.coordinator
        picker.allowsMultipleSelection = false
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: DocumentPicker
        
        init(_ parent: DocumentPicker) {
            self.parent = parent
        }
        
        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            guard let url = urls.first else { return }
            parent.url = url
        }
    }
}
