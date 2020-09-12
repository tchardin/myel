//
//  Sigs.swift
//  MyelTests
//
//  Created by Thomas Chardin on 9/9/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import XCTest
@testable import Myel

class SigsTests: XCTestCase {

    func testSecp256k1() throws {
        // Verify private key
        let signingKey = Secp256k1.PrivateKey()
        XCTAssertEqual(signingKey.rawValue.count, 32)
        // Verify digest
        var msg = [UInt8](repeating: 0, count: 32)
        for (i, _) in msg.enumerated() {
            msg[i] = UInt8(i)
        }
        let digest = try! signingKey.signature(for: msg)
        XCTAssertEqual(digest.count, 65)
        // Verify signature
        let signingPublicKey = signingKey.publicKey!
        let isValid = try! signingPublicKey.isValidSignature(digest, for: msg)

        XCTAssertTrue(isValid)
    }
}
