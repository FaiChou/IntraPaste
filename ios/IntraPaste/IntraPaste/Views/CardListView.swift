import SwiftUI
import PhotosUI

extension String {
    func height(withConstrainedWidth width: CGFloat) -> CGFloat {
        let size = CGSize(width: width, height: .greatestFiniteMagnitude)
        let attributes = [NSAttributedString.Key.font: UIFont.systemFont(ofSize: UIFont.systemFontSize)]
        let estimatedFrame = self.boundingRect(with: size,
                                             options: .usesLineFragmentOrigin,
                                             attributes: attributes,
                                             context: nil)
        return estimatedFrame.height + 20
    }
}

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
        ZStack {
            VStack {
                ZStack {
                    if isLoading && cards.isEmpty {
                        VStack {
                            ProgressView()
                            Spacer()
                        }
                    } else {
                        List {
                            ForEach(cards) { card in
                                CardCell(card: card)
                            }
                        }
                        .refreshable {
                            await refreshCards()
                        }
                    }
                }
                
                HStack(spacing: 8) {
                    if minioEnabled {
                        Menu {
                            Button(action: {
                                showingCamera = true
                            }) {
                                Label("Camera", systemImage: "camera")
                            }
                            Button(action: {
                                showingImagePicker = true
                            }) {
                                Label("Photo", systemImage: "photo")
                            }
                            Button(action: {
                                showingDocumentPicker = true
                            }) {
                                Label("Document", systemImage: "doc")
                            }
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                                .font(.system(size: 24))
                        }
                    }
                    
                    TextEditor(text: $newContent)
                        .frame(
                            minHeight: 40,
                            maxHeight: max(40, min(120, newContent.height(withConstrainedWidth: UIScreen.main.bounds.width - 120)))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )
                    
                    Button(action: createNewCard) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 20))
                    }
                    .disabled(newContent.isEmpty)
                }
                .padding()
            }
        }
        .navigationTitle(server.name)
        .toolbarRole(.editor)
        .sheet(isPresented: $showingDocumentPicker) {
            DocumentPicker(url: $selectedDocument)
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(selectedImage: $selectedImage)
        }
        .sheet(isPresented: $showingCamera) {
            CameraPicker(selectedImage: $selectedImage)
                .presentationDetents([.large])
                .presentationDragIndicator(.hidden)
                .ignoresSafeArea()
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
