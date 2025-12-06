import SwiftUI
import PhotosUI

struct CardListView: View {
    let server: Server
    @EnvironmentObject var serverManager: ServerManager
    @State private var cards: [Card] = []
    @State private var newContent = ""
    @State private var isLoading = false
    @State private var error: String?
    @State private var s3Enabled = false
    @State private var showingDocumentPicker = false
    @State private var selectedDocument: URL?
    @State private var showingImagePicker = false
    @State private var selectedImage: UIImage?
    @State private var buttonWidth: CGFloat = 0
    @State private var showingCamera = false
    @State private var isInputLoading = false
    
    private let successFeedback = UINotificationFeedbackGenerator()
    private let errorFeedback = UIImpactFeedbackGenerator(style: .heavy)
    
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
                isLoading: $isInputLoading,
                s3Enabled: s3Enabled,
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
            checkS3Status()
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
                isInputLoading = true
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
                    provideSuccessFeedback()
                    await refreshCards()
                } catch {
                    self.error = "Upload failed"
                    provideErrorFeedback()
                }
                isInputLoading = false
            }
        }
        .onChange(of: selectedImage) { newImage in
            guard let image = newImage,
                  let imageData = image.jpegData(compressionQuality: 0.8) else { return }
            
            Task {
                isInputLoading = true
                do {
                    _ = try await APIClient.shared.uploadFile(
                        fileData: imageData,
                        fileName: "\(Date().timeIntervalSince1970).jpg",
                        fileType: .image,
                        server: server
                    )
                    selectedImage = nil
                    provideSuccessFeedback()
                    await refreshCards()
                } catch {
                    self.error = "Upload failed"
                    provideErrorFeedback()
                }
                isInputLoading = false
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
            isInputLoading = true
            do {
                _ = try await APIClient.shared.createCard(content: newContent, server: server)
                newContent = ""
                provideSuccessFeedback()
                fetchCards()
                dismissKeyboard()
            } catch {
                self.error = "Failed to create card"
                provideErrorFeedback()
            }
            isInputLoading = false
        }
    }
    
    @MainActor
    private func refreshCards() async {
        do {
            let refreshedCards = try await APIClient.shared.fetchCards(from: server)
            cards = refreshedCards
        } catch {
            self.error = "Refresh failed"
            provideErrorFeedback()
        }
    }
    
    private func dismissKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder),
                                      to: nil, from: nil, for: nil)
    }
    
    @MainActor
    private func checkS3Status() {
        Task {
            do {
                s3Enabled = try await APIClient.shared.checkS3Status(server: server)
            } catch {
                s3Enabled = false
                print("Failed to check S3 status:", error)
            }
        }
    }
    
    private func provideSuccessFeedback() {
        successFeedback.notificationOccurred(.success)
    }
    
    private func provideErrorFeedback() {
        errorFeedback.impactOccurred()
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
