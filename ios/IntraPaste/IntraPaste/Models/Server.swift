import Foundation

struct Server: Identifiable, Codable {
    let id: UUID
    let name: String
    let url: String
    var isLoggedIn: Bool
    
    init(id: UUID = UUID(), name: String, url: String, isLoggedIn: Bool = false) {
        self.id = id
        self.name = name
        self.url = url
        self.isLoggedIn = isLoggedIn
    }
}