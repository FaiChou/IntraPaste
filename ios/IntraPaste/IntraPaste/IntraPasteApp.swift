//
//  IntraPasteApp.swift
//  IntraPaste
//
//  Created by FaiChou on 2025/1/8.
//

import SwiftUI

@main
struct IntraPasteApp: App {
    @StateObject var serverManager = ServerManager()
    var body: some Scene {
        WindowGroup {
            ServerListView()
                .environmentObject(serverManager)
                .onAppear {
                    if let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
                        UserDefaults.standard.set(version, forKey: "version_preference")
                    }
                }
        }
    }
}
