import Foundation

struct Card: Identifiable, Codable {
    let id: Int
    let content: String?
    let createdAt: Date
    let expiresAt: Date
    let type: String
    
    let fileName: String?
    let fileSize: Int?
    let fileType: String?
    let filePath: String?
    
    let ipAddress: String?
    let userAgent: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case createdAt
        case expiresAt
        case type
        case fileName
        case fileSize
        case fileType
        case filePath
        case ipAddress
        case userAgent
    }
}