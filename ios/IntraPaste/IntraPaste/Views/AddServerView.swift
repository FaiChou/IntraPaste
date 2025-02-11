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
                    TextField("Server Name", text: $name)
                    TextField("Server URL", text: $url)
                        .keyboardType(.URL)
                        .autocorrectionDisabled()
                        .autocapitalization(.none)
                }
                
                if let error = error {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Add Server")
            .navigationBarItems(
                leading: Button("Cancel") { dismiss() },
                trailing: Button("Save") { validateAndSave() }
                    .disabled(name.isEmpty || url.isEmpty || isValidating)
            )
        }
    }
    
    @MainActor
    private func validateAndSave() {
        guard var urlComponents = URLComponents(string: url) else {
            error = "Invalid URL"
            return
        }
        
        if urlComponents.scheme == nil {
            urlComponents.scheme = "http"
        }
        
        guard let finalURL = urlComponents.url?.absoluteString else {
            error = "Invalid URL"
            return
        }
        
        isValidating = true
        
        Task {
            do {
                let _ = try await APIClient.shared.fetchCards(from: Server(name: name, url: finalURL))
                serverManager.addServer(Server(name: name, url: finalURL))
                dismiss()
            } catch {
                self.error = "Unable to connect to server"
                isValidating = false
            }
        }
    }
}
