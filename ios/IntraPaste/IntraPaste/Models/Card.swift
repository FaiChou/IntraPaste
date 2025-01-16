import Foundation

struct Card: Identifiable, Codable {
    let id: Int
    let content: String?
    let createdAt: Date
    let expiresAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case createdAt
        case expiresAt
    }
}