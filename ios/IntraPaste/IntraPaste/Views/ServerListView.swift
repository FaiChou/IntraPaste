import SwiftUI

struct ServerListView: View {
    @StateObject private var serverManager = ServerManager()
    @State private var showingAddServer = false
    
    var body: some View {
        NavigationView {
            List {
                ForEach(serverManager.servers) { server in
                    NavigationLink(destination: CardListView(server: server)) {
                        VStack(alignment: .leading) {
                            Text(server.name)
                                .font(.headline)
                            Text(server.url)
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                    }
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        serverManager.removeServer(serverManager.servers[index])
                    }
                }
            }
            .navigationTitle("服务器列表")
            .toolbar {
                Button(action: { showingAddServer = true }) {
                    Image(systemName: "plus")
                }
            }
            .sheet(isPresented: $showingAddServer) {
                AddServerView(serverManager: serverManager)
            }
        }
    }
}