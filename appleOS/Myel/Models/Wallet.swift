//
//  Wallet.swift
//  Myel
//
//  Created by Thomas Chardin on 9/7/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import Foundation
import LocalAuthentication

struct Wallet {
    let privKey: Secp256k1.PrivateKey
    let pubKey: Secp256k1.PublicKey
    let secpAddr: Address.Secp256k1
    let mm: String
    
    let blsSecret: Blst.PrivateKey
    let blsKey: Blst.PublicKey
    let blsAddr: Address.BLS
    init() {
        self.privKey = Secp256k1.PrivateKey()
        self.mm = Mnemonic.mnemonicString(from: privKey.hexString)!
        self.pubKey = privKey.publicKey!
        self.secpAddr = Address.Secp256k1(pubkey: pubKey.rawValue)
        
        self.blsSecret = Blst.PrivateKey()
        self.blsKey = blsSecret.publicKey
        self.blsAddr = Address.BLS(pubkey: blsKey.rawValue)
    }
    
    // Can create Access Groups
//    public func addToKeychain() -> Void {
//        let context = LAContext()
//        let access = SecAccessControlCreateWithFlags(nil, kSecAttrAccessibleWhenUnlocked, .userPresence, nil)
//        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
//                                    kSecAttrAccount as String: "MyelAccount",
//                                    kSecAttrAccessControl as String: access as Any,
//                                    kSecUseAuthenticationContext as String: context,
//                                    kSecValueData as String: self.privKey.hexString.data(using: String.Encoding.utf8)!]
//        let status = SecItemAdd(query as CFDictionary, nil)
//        guard status == errSecSuccess else {
//            // TODO handle error
//            print("Failed to save private key in keychain", SecCopyErrorMessageString(status, nil) as Any)
//            return
//        }
//    }
}
