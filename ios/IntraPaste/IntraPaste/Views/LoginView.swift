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
                    SecureField("Password", text: $password)
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
                            Text("Login")
                        }
                    }
                    .disabled(password.isEmpty || isLoading)
                }
            }
            .navigationTitle("Admin Login")
            .navigationBarItems(leading: Button("Cancel") { dismiss() })
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
                self.error = "Login failed"
                isLoading = false
            }
        }
    }
}
