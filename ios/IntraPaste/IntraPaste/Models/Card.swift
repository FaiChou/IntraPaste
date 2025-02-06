import Foundation

struct Card: Identifiable, Codable {
    let id: Int
    let content: String?
    let type: String
    let fileName: String?
    let fileType: String?
    let filePath: String?
    let fileSize: Int?
    let createdAt: Date
    let expiresAt: Date
    
    let ipAddress: String?
    let userAgent: String?
    
    enum CodingKeys: String, CodingKey {
        case id, content, type, fileName, fileType, filePath, fileSize, createdAt, expiresAt
        case ipAddress
        case userAgent
    }
    
    var isMediaType: Bool {
        return type == "image" || type == "video" || type == "audio"
    }
    
    var isPlayableVideo: Bool {
        guard type == "video", let fileType = fileType else { return false }
        return fileType.contains("mp4") || fileType.contains("mov") || fileType.contains("webm")
    }
    
    var isPlayableAudio: Bool {
        guard type == "audio", let fileType = fileType else { return false }
        return fileType.contains("mp3") || fileType.contains("wav") || 
               fileType.contains("m4a") || fileType.contains("aac") ||
               fileType.contains("mpeg")
    }
}