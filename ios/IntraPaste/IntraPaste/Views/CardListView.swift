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
        return estimatedFrame.height + 20 // 添加一些额外的padding
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
                
                HStack {
                    TextEditor(text: $newContent)
                        .frame(minHeight: 40, maxHeight: max(40, min(120, newContent.height(withConstrainedWidth: UIScreen.main.bounds.width - 120))))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )
                    
                    PhotosPicker(selection: $selectedItem, matching: .images) {
                        Image(systemName: "photo")
                            .foregroundColor(.green)
                    }
                    
                    Button(action: createNewCard) {
                        Image(systemName: "paperplane.fill")
                    }
                    .disabled(newContent.isEmpty)
                }
                .padding()
            }
        }
        .navigationTitle("卡片列表")
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
        .onAppear {
            if cards.isEmpty {
                fetchCards()
            }
        }
        .alert("错误", isPresented: .constant(error != nil)) {
            Button("确定") { error = nil }
        } message: {
            if let error = error {
                Text(error)
            }
        }
        .onChange(of: selectedItem) { _ in
            Task {
                if let data = try? await selectedItem?.loadTransferable(type: Data.self),
                   let uiImage = UIImage(data: data),
                   let imageData = uiImage.jpegData(compressionQuality: 0.8) {
                    do {
                        _ = try await APIClient.shared.uploadImage(
                            imageData: imageData,
                            fileName: "\(Date().timeIntervalSince1970).jpg",
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
}
