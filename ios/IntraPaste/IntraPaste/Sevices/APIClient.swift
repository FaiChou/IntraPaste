import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case unauthorized
    case decodingError
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
            "fileUrl": fileUrl as Any
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
    
    func login(password: String, server: Server) async throws {
        guard let url = URL(string: "\(server.url)/api/auth/login") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["password": password]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.unauthorized
        }
        
        struct LoginResponse: Decodable {
            let success: Bool
        }
        
        let loginResponse = try JSONDecoder().decode(LoginResponse.self, from: data)
        
        guard loginResponse.success else {
            throw APIError.unauthorized
        }
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
    
    func uploadImage(imageData: Data, fileName: String, server: Server) async throws -> Card {
        // 1. 获取预签名 URL
        guard let url = URL(string: "\(server.url)/api/upload") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "fileName": fileName,
            "fileType": "image/jpeg"
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
        
        // 2. 上传图片到预签名 URL
        guard let uploadURL = URL(string: uploadResponse.data.uploadUrl) else {
            throw APIError.invalidURL
        }
        
        var uploadRequest = URLRequest(url: uploadURL)
        uploadRequest.httpMethod = "PUT"
        uploadRequest.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")
        uploadRequest.httpBody = imageData
        
        let (_, uploadResponseData) = try await URLSession.shared.data(for: uploadRequest)
        
        guard let uploadHttpResponse = uploadResponseData as? HTTPURLResponse,
              uploadHttpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        // 3. 创建卡片
        return try await createCard(
            content: "",
            type: "image",
            fileName: fileName,
            objectName: uploadResponse.data.objectName,
            fileUrl: uploadResponse.data.fileUrl,
            server: server
        )
    }
}
