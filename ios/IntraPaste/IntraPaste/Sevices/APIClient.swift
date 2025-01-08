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
    
    func createCard(content: String, server: Server) async throws -> Card {
        guard let url = URL(string: "\(server.url)/api/cards") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["content": content]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(APIClient.dateFormatter)
        
        return try decoder.decode(Card.self, from: data)
    }
    
    func login(password: String, server: Server) async throws -> String {
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
        
        struct LoginResponse: Codable {
            let success: Bool
            let token: String
        }
        
        let loginResponse = try JSONDecoder().decode(LoginResponse.self, from: data)
        return loginResponse.token
    }
    
    func deleteCard(id: Int, server: Server) async throws {
        guard let token = server.token else {
            throw APIError.unauthorized
        }
        
        guard let url = URL(string: "\(server.url)/api/cards/\(id)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
    }
}
