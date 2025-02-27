//
//  InputBar.swift
//  IntraPaste
//
//  Created by FaiChou on 2025/2/27.
//

import SwiftUI

extension String {
    func height(withConstrainedWidth width: CGFloat) -> CGFloat {
        let size = CGSize(width: width, height: .greatestFiniteMagnitude)
        let attributes = [NSAttributedString.Key.font: UIFont.systemFont(ofSize: UIFont.systemFontSize)]
        let estimatedFrame = self.boundingRect(with: size,
                                             options: .usesLineFragmentOrigin,
                                             attributes: attributes,
                                             context: nil)
        return estimatedFrame.height + 20
    }
}

struct InputBar: View {
    @Binding var text: String
    @Binding var showingCamera: Bool
    @Binding var showingImagePicker: Bool
    @Binding var showingDocumentPicker: Bool
    @Environment(\.colorScheme) var colorScheme
    let minioEnabled: Bool
    let onSend: () -> Void
    private let minHeight: CGFloat = 40
    private let maxHeight: CGFloat = UIScreen.main.bounds.height / 3
    @State private var textHeight: CGFloat = 40
    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            if minioEnabled {
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
                        .padding(.bottom, 10)
                }
            }
            ZStack(alignment: .bottomTrailing) {
                TextEditor(text: $text)
                    .tint(colorScheme == .light ? .black : .white)
                    .scrollIndicators(.hidden)
                    .frame(height: textHeight)
                    .padding(.leading, 10)
                    .padding(.trailing, 40)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(colorScheme == .light ? .white : .black)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(.gray.opacity(0.2), lineWidth: 1)
                    )
                    .onChange(of: text) { _ in
                        let newHeight = text.height(withConstrainedWidth: UIScreen.main.bounds.width - 120)
                        textHeight = min(max(minHeight, newHeight), maxHeight)
                    }
                Button(action: onSend) {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(colorScheme == .light ? .white : .black)
                        .frame(width: 28, height: 28)
                        .background(
                            Circle()
                                .fill(colorScheme == .light ? Color.black : Color.white)
                        )
                }
                .disabled(text.isEmpty)
                .padding(6)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}
