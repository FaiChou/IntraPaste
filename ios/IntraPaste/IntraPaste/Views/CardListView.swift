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
    @State private var showingLoginSheet = false
    @State private var isLoading = false
    @State private var error: String?
    @State private var selectedItem: PhotosPickerItem?
    @State private var minioEnabled = false
    @State private var showingActionSheet = false
    @State private var showingDocumentPicker = false
    @State private var selectedDocument: URL?
    @State private var showingPhotoPicker = false
    @State private var isExpanded = false
    @State private var buttonWidth: CGFloat = 0
    
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
                                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                        if server.isLoggedIn {
                                            Button(role: .destructive) {
                                                deleteCard(card)
                                            } label: {
                                                Label("删除", systemImage: "trash")
                                            }
                                        }
                                    }
                            }
                        }
                        .refreshable {
                            await refreshCards()
                        }
                    }
                }
                
                HStack(spacing: 8) {
                    if minioEnabled {
                        HStack(spacing: 8) {
                            Button(action: {
                                withAnimation(.spring()) {
                                    isExpanded.toggle()
                                }
                            }) {
                                Image(systemName: isExpanded ? "xmark.circle.fill" : "plus.circle.fill")
                                    .foregroundColor(.blue)
                                    .font(.system(size: 24))
                            }
                            
                            if isExpanded {
                                PhotosPicker(
                                    selection: $selectedItem,
                                    matching: .images
                                ) {
                                    HStack {
                                        Image(systemName: "photo")
                                    }
                                    .foregroundColor(.blue)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(8)
                                }
                                .transition(.move(edge: .leading).combined(with: .opacity))
                                
                                Button(action: {
                                    showingDocumentPicker = true
                                }) {
                                    HStack {
                                        Image(systemName: "doc")
                                    }
                                    .foregroundColor(.blue)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(8)
                                }
                                .transition(.move(edge: .leading).combined(with: .opacity))
                            }
                        }
                    }
                    
                    TextEditor(text: $newContent)
                        .frame(
                            minHeight: 40,
                            maxHeight: max(40, min(120, newContent.height(withConstrainedWidth: isExpanded ? UIScreen.main.bounds.width - 240 : UIScreen.main.bounds.width - 120)))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )
                        .onTapGesture {
                            if isExpanded {
                                withAnimation(.spring()) {
                                    isExpanded = false
                                }
                            }
                        }
                    
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
        .toolbar {
            if !server.isLoggedIn {
                Button("登录") {
                    showingLoginSheet = true
                }
            } else {
                Button("登出") {
                    serverManager.updateServerLoginStatus(for: server, isLoggedIn: false)
                }
            }
        }
        .sheet(isPresented: $showingLoginSheet) {
            LoginView(server: server)
        }
        .confirmationDialog("选择上传类型", isPresented: $showingActionSheet, titleVisibility: .visible) {
            PhotosPicker(
                selection: $selectedItem,
                matching: .images
            ) {
                Text("从相册选择")
            }
            
            Button("选择文件") {
                showingDocumentPicker = true
            }
        }
        .sheet(isPresented: $showingDocumentPicker) {
            DocumentPicker(url: $selectedDocument)
        }
        .onAppear {
            if cards.isEmpty {
                fetchCards()
            }
            checkMinioStatus()
        }
        .alert("错误", isPresented: .constant(error != nil)) {
            Button("确定") { error = nil }
        } message: {
            if let error = error {
                Text(error)
            }
        }
        .onChange(of: selectedItem) { _ in
            if isExpanded {
                withAnimation(.spring()) {
                    isExpanded = false
                }
            }
            Task {
                if let data = try? await selectedItem?.loadTransferable(type: Data.self),
                   let uiImage = UIImage(data: data),
                   let imageData = uiImage.jpegData(compressionQuality: 0.8) {
                    do {
                        _ = try await APIClient.shared.uploadFile(
                            fileData: imageData,
                            fileName: "\(Date().timeIntervalSince1970).jpg",
                            fileType: .image,
                            server: server
                        )
                        selectedItem = nil
                        await refreshCards()
                    } catch {
                        self.error = "上传图片失败"
                    }
                }
            }
        }
        .onChange(of: selectedDocument) { newValue in
            if isExpanded {
                withAnimation(.spring()) {
                    isExpanded = false
                }
            }
            guard let fileURL = newValue else { return }
            
            Task {
                do {
                    let fileName = fileURL.lastPathComponent
                    let fileData = try Data(contentsOf: fileURL)
                    
                    _ = try await APIClient.shared.uploadFile(
                        fileData: fileData,
                        fileName: fileName,
                        fileType: .document,
                        server: server
                    )
                    selectedDocument = nil
                    await refreshCards()
                } catch {
                    self.error = "上传文件失败"
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
                self.error = "获取卡片失败"
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
                self.error = "创建卡片失败"
            }
        }
    }
    
    @MainActor
    private func deleteCard(_ card: Card) {
        Task {
            do {
                try await APIClient.shared.deleteCard(id: card.id, server: server)
                fetchCards()
            } catch {
                switch error {
                case APIError.unauthorized:
                    serverManager.updateServerLoginStatus(for: server, isLoggedIn: false)
                    self.error = "登录已过期，请重新登录"
                default:
                    self.error = "删除卡片失败"
                }
            }
        }
    }
    @MainActor
    private func refreshCards() async {
        do {
            let refreshedCards = try await APIClient.shared.fetchCards(from: server)
            cards = refreshedCards
        } catch {
            self.error = "刷新失败"
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
