import SwiftUI

struct CardListView: View {
    let server: Server
    @State private var cards: [Card] = []
    @State private var newContent = ""
    @State private var showingLoginSheet = false
    @State private var isLoading = false
    @State private var error: String?
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
            } else {
                List {
                    ForEach(cards) { card in
                        CardCell(card: card)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                if server.token != nil {
                                    Button(role: .destructive) {
                                        deleteCard(card)
                                    } label: {
                                        Label("删除", systemImage: "trash")
                                    }
                                }
                            }
                    }
                }
            }
            
            HStack {
                TextField("输入新内容", text: $newContent)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button(action: createNewCard) {
                    Image(systemName: "paperplane.fill")
                }
                .disabled(newContent.isEmpty)
            }
            .padding()
        }
        .navigationTitle("卡片列表")
        .toolbar {
            if server.token == nil {
                Button("登录") {
                    showingLoginSheet = true
                }
            }
        }
        .sheet(isPresented: $showingLoginSheet) {
            LoginView(server: server)
        }
        .onAppear {
            fetchCards()
        }
        .alert("错误", isPresented: .constant(error != nil)) {
            Button("确定") { error = nil }
        } message: {
            if let error = error {
                Text(error)
            }
        }
    }
    
    private func fetchCards() {
        isLoading = true
        Task {
            do {
                cards = try await APIClient.shared.fetchCards(from: server)
                await MainActor.run {
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.error = "获取卡片失败"
                    isLoading = false
                }
            }
        }
    }
    
    private func createNewCard() {
        guard !newContent.isEmpty else { return }
        
        Task {
            do {
                _ = try await APIClient.shared.createCard(content: newContent, server: server)
                await MainActor.run {
                    newContent = ""
                    fetchCards()
                }
            } catch {
                await MainActor.run {
                    self.error = "创建卡片失败"
                }
            }
        }
    }
    
    private func deleteCard(_ card: Card) {
        Task {
            do {
                try await APIClient.shared.deleteCard(id: card.id, server: server)
                await MainActor.run {
                    fetchCards()
                }
            } catch {
                await MainActor.run {
                    self.error = "删除卡片失败"
                }
            }
        }
    }
} 