import Foundation

class ServerManager: ObservableObject {
    @Published var servers: [Server] = []
    private let userDefaults = UserDefaults.standard
    private let serversKey = "saved_servers"
    
    init() {
        loadServers()
    }
    
    private func loadServers() {
        if let data = userDefaults.data(forKey: serversKey),
           let servers = try? JSONDecoder().decode([Server].self, from: data) {
            self.servers = servers
        }
    }
    
    func addServer(_ server: Server) {
        servers.append(server)
        saveServers()
    }
    
    func removeServer(_ server: Server) {
        servers.removeAll { $0.id == server.id }
        saveServers()
    }
    
    private func saveServers() {
        if let data = try? JSONEncoder().encode(servers) {
            userDefaults.set(data, forKey: serversKey)
        }
    }
    
    func updateServerLoginStatus(for server: Server, isLoggedIn: Bool) {
        if let index = servers.firstIndex(where: { $0.id == server.id }) {
            servers[index].isLoggedIn = isLoggedIn
            saveServers()
        }
    }
}