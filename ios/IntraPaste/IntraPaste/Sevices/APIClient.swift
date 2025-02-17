import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case unauthorized
    case decodingError
}

struct MinioHealthResponse: Decodable {
    let enabled: Bool
}

// 添加文件类型枚举
enum FileType {
    case image
    case document
    
    var mimeType: String {
        switch self {
        case .image:
            return "image/jpeg"
        case .document:
            return "application/octet-stream"
        }
    }
    
    var cardType: String {
        switch self {
        case .image:
            return "image"
        case .document:
            return "file"
        }
    }
}

class APIClient {
    static let shared = APIClient()
    
    static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()
    
    private init() {}
    
    func fetchCards(from server: Server) async throws -> [Card] {
        guard let url = URL(string: "\(server.url)/api/cards") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(APIClient.dateFormatter)
        
        return try decoder.decode([Card].self, from: data)
    }
    
    func createCard(
        content: String,
        type: String = "text",
        fileName: String? = nil,
        objectName: String? = nil,
        fileUrl: String? = nil,
        fileType: String? = nil,
        fileSize: Int? = nil,
        server: Server
    ) async throws -> Card {
        guard let url = URL(string: "\(server.url)/api/cards") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "content": content,
            "type": type,
            "fileName": fileName as Any,
            "objectName": objectName as Any,
            "fileUrl": fileUrl as Any,
            "fileType": fileType as Any,
            "fileSize": fileSize as Any
        ].compactMapValues { $0 }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(APIClient.dateFormatter)
        
        return try decoder.decode(Card.self, from: data)
    }
    
    func deleteCard(id: Int, server: Server) async throws {
        guard server.isLoggedIn else {
            throw APIError.unauthorized
        }
        
        guard let url = URL(string: "\(server.url)/api/cards/\(id)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            if httpResponse.statusCode == 401 {
                throw APIError.unauthorized
            }
            throw APIError.invalidResponse
        }
    }
    
    func uploadFile(fileData: Data, fileName: String, fileType: FileType = .document, server: Server) async throws -> Card {
        guard let url = URL(string: "\(server.url)/api/upload") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "fileName": fileName,
            "fileType": fileType.mimeType
        ]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        struct UploadResponse: Decodable {
            let success: Bool
            let data: UploadData
            
            struct UploadData: Decodable {
                let uploadUrl: String
                let objectName: String
                let fileUrl: String
            }
        }
        
        let uploadResponse = try JSONDecoder().decode(UploadResponse.self, from: data)
        
        guard let uploadURL = URL(string: uploadResponse.data.uploadUrl) else {
            throw APIError.invalidURL
        }
        
        var uploadRequest = URLRequest(url: uploadURL)
        uploadRequest.httpMethod = "PUT"
        uploadRequest.setValue(fileType.mimeType, forHTTPHeaderField: "Content-Type")
        uploadRequest.httpBody = fileData
        
        let (_, uploadResponseData) = try await URLSession.shared.data(for: uploadRequest)
        
        guard let uploadHttpResponse = uploadResponseData as? HTTPURLResponse,
              uploadHttpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        return try await createCard(
            content: "",
            type: fileType.cardType,
            fileName: fileName,
            objectName: uploadResponse.data.objectName,
            fileUrl: uploadResponse.data.fileUrl,
            fileType: fileType.mimeType,
            fileSize: fileData.count,
            server: server
        )
    }
    
    func uploadImage(imageData: Data, fileName: String, server: Server) async throws -> Card {
        return try await uploadFile(
            fileData: imageData,
            fileName: fileName,
            fileType: .image,
            server: server
        )
    }
    
    func checkMinioStatus(server: Server) async throws -> Bool {
        guard let url = URL(string: "\(server.url)/api/minio/health") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let healthResponse = try JSONDecoder().decode(MinioHealthResponse.self, from: data)
        return healthResponse.enabled
    }
}

