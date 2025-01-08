import SwiftUI

struct AddServerView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject var serverManager: ServerManager
    
    @State private var name = ""
    @State private var url = ""
    @State private var isValidating = false
    @State private var error: String?
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("服务器名称", text: $name)
                    TextField("服务器地址", text: $url)
                }
                
                if let error = error {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("添加服务器")
            .navigationBarItems(
                leading: Button("取消") { dismiss() },
                trailing: Button("保存") { validateAndSave() }
                    .disabled(name.isEmpty || url.isEmpty || isValidating)
            )
        }
    }
    
    private func validateAndSave() {
        guard var urlComponents = URLComponents(string: url) else {
            error = "无效的URL"
            return
        }
        
        if urlComponents.scheme == nil {
            urlComponents.scheme = "http"
        }
        
        guard let finalURL = urlComponents.url?.absoluteString else {
            error = "无效的URL"
            return
        }
        
        isValidating = true
        
        Task {
            do {
                let _ = try await APIClient.shared.fetchCards(from: Server(name: name, url: finalURL))
                await MainActor.run {
                    serverManager.addServer(Server(name: name, url: finalURL))
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    self.error = "无法连接到服务器"
                    isValidating = false
                }
            }
        }
    }
}
