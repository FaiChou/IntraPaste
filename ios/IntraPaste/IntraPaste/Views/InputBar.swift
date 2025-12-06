//
//  InputBar.swift
//  IntraPaste
//
//  Created by FaiChou on 2025/2/27.
//

import SwiftUI

struct InputBar: View {
    @Binding var text: String
    @Binding var showingCamera: Bool
    @Binding var showingImagePicker: Bool
    @Binding var showingDocumentPicker: Bool
    @Binding var isLoading: Bool
    @Environment(\.colorScheme) var colorScheme
    let s3Enabled: Bool
    let onSend: () -> Void
    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            if s3Enabled {
                Menu {
                    Button(action: {
                        showingCamera = true
                    }) {
                        Label("Camera", systemImage: "camera")
                    }
                    Button(action: {
                        showingImagePicker = true
                    }) {
                        Label("Photo", systemImage: "photo")
                    }
                    Button(action: {
                        showingDocumentPicker = true
                    }) {
                        Label("Document", systemImage: "doc")
                    }
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 20))
                        .foregroundColor(colorScheme == .light ? .black : .white)
                        .padding(.bottom, 15)
                }
            }
            ZStack(alignment: .bottomTrailing) {
                TextField("", text: $text, axis: .vertical)
                    .lineLimit(6)
                    .background(.clear)
                    .frame(minHeight: 40)
                    .padding(.vertical, 5)
                    .padding(.leading, 10)
                    .padding(.trailing, 45)
                    .overlay(
                        RoundedRectangle(cornerRadius: 25)
                            .stroke(.gray.opacity(0.3), lineWidth: 1)
                    )
                Button(action: onSend) {
                    Group {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: colorScheme == .light ? .white : .black))
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "arrow.up")
                                .font(.system(size: 16, weight: .semibold))
                        }
                    }
                    .foregroundColor(colorScheme == .light ? .white : .black)
                    .frame(width: 30, height: 30)
                    .background(
                        Circle()
                            .fill(text.isEmpty ? Color.gray : (colorScheme == .light ? Color.black : Color.white))
                    )
                }
                .disabled(text.isEmpty || isLoading)
                .padding(10)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}
