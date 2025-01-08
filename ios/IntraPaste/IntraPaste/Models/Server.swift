import Foundation

struct Server: Identifiable, Codable {
    let id: UUID
    let name: String
    let url: String
    var token: String?
    
    init(id: UUID = UUID(), name: String, url: String, token: String? = nil) {
        self.id = id
        self.name = name
        self.url = url
        self.token = token
    }
} 