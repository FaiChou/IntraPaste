import Foundation

class FileDownloader {
    static let shared = FileDownloader()
    
    private init() {}
    
    func downloadFile(from urlString: String, fileName: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = URL(string: urlString) else {
            completion(.failure(DownloadError.invalidURL))
            return
        }
        
        let task = URLSession.shared.downloadTask(with: url) { localURL, _, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let localURL = localURL else {
                completion(.failure(DownloadError.downloadFailed))
                return
            }
            
            do {
                let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let destinationURL = documentsPath.appendingPathComponent(fileName)
                
                if FileManager.default.fileExists(atPath: destinationURL.path) {
                    try FileManager.default.removeItem(at: destinationURL)
                }
                try FileManager.default.copyItem(at: localURL, to: destinationURL)
                completion(.success(()))
            } catch {
                completion(.failure(error))
            }
        }
        task.resume()
    }
    
    enum DownloadError: Error {
        case invalidURL
        case downloadFailed
    }
}
