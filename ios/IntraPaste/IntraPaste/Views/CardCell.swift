import SwiftUI

struct CardCell: View {
    let card: Card
    @State private var isCopied = false
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(card.content)
                    .lineLimit(3)
                
                Text(card.createdAt.formatted())
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            Spacer()
        }
        .contentShape(Rectangle())
        .onTapGesture {
            UIPasteboard.general.string = card.content
            withAnimation {
                isCopied = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                withAnimation {
                    isCopied = false
                }
            }
        }
        .overlay(alignment: .trailing) {
            if isCopied {
                Text("已复制")
                    .font(.caption)
                    .foregroundColor(.green)
                    .padding(.horizontal)
            }
        }
    }
}