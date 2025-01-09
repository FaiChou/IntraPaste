//
//  IntraPasteTests.swift
//  IntraPasteTests
//
//  Created by 周辉 on 2025/1/8.
//
import Foundation
import Testing
@testable import IntraPaste



@Test(.disabled("Due to that .iso8601 not support fractional seconds in the date string."),
      .bug("https://stackoverflow.com/questions/50847139/error-decoding-date-with-swift", "Error Decoding Date with Swift"))
func testJsonParse() throws {
    let jsonData = """
    [{"id":7,"content":"Hello","createdAt":"2025-01-08T04:02:43.760Z","expiresAt":"2025-01-08T05:02:43.759Z"},{"id":6,"content":"22","createdAt":"2025-01-08T04:02:37.086Z","expiresAt":"2025-01-08T05:02:37.084Z"}]
    """.data(using: .utf8)!
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    let cards = try decoder.decode([Card].self, from: jsonData)
    #expect(cards.count == 2)
}
