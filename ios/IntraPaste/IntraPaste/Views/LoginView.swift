import SwiftUI

struct LoginView: View {
    let server: Server
    @EnvironmentObject var serverManager: ServerManager
    @Environment(\.dismiss) private var dismiss
    @State private var password = ""
    @State private var error: String?
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    SecureField("密码", text: $password)
                }
                
                if let error = error {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
                
                Section {
                    Button(action: login) {
                        if isLoading {
                            ProgressView()
                        } else {
                            Text("登录")
                        }
                    }
                    .disabled(password.isEmpty || isLoading)
                }
            }
            .navigationTitle("管理员登录")
            .navigationBarItems(leading: Button("取消") { dismiss() })
        }
    }
    
    @MainActor
    private func login() {
        isLoading = true
        
        Task {
            do {
                let _ = try await APIClient.shared.login(password: password, server: server)
                serverManager.updateServerLoginStatus(for: server, isLoggedIn: true)
                isLoading = false
                dismiss()
            } catch {
                self.error = "登录失败"
                isLoading = false
            }
        }
    }
}
