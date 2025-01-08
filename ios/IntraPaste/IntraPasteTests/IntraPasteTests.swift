//
//  IntraPasteTests.swift
//  IntraPasteTests
//
//  Created by 周辉 on 2025/1/8.
//
import XCTest
import Foundation
import Testing
@testable import IntraPaste

struct IntraPasteTests {

    @Test func example() async throws {
        let jsonData = """
        [{"id":7,"content":"Hello","createdAt":"2025-01-08T04:02:43.760Z","expiresAt":"2025-01-08T05:02:43.759Z"},{"id":6,"content":"22","createdAt":"2025-01-08T04:02:37.086Z","expiresAt":"2025-01-08T05:02:37.084Z"}]
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601 //  关键：指定日期格式

        do {
            let cards = try decoder.decode([Card].self, from: jsonData)
            XCTAssertEqual(cards.count, 2)
            XCTAssertEqual(cards[0].id, 7)
            XCTAssertEqual(cards[0].content, "Hello")
            // 添加更多断言来验证 createdAt 和 expiresAt 的值，由于时区的原因，直接比较可能失败，建议比较时间戳或使用更灵活的断言方式。
            XCTAssertEqual(cards[1].id, 6)
            XCTAssertEqual(cards[1].content, "22")
        } catch {
            XCTFail("Failed to decode JSON: \(error)")
        }
    }
}
