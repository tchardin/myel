//
//  Blst.swift
//  Myel
//
//  Created by Thomas Chardin on 9/5/20.
//  Copyright © 2020 Myel. All rights reserved.
//
// Why BLS signatures?
// - BLS signatures are deterministic: for a given message and a given secret key, the signature is always the same. That feature removes an important security weakness of most randomized signature schemes: signer must never re-use the same randomness twice otherwise this reveals its private key. As well, deterministic signatures are an ideal candidate to reduce the attack surface in terms of grinding, which is a real concern in recent proof of stake systems.
// - BLS signatures are aggregatable: one can aggregate signatures from different signers into one single signature. This feature enables drastically saving space on the blockchain, especially when aggregating user transactions.
// This signature is used for miners to sign block

import CryptoKit
import Foundation

public enum Blst {
    public struct PrivateKey {
        public var rawValue: [UInt8]
        
        public init() {
            let bytesCount = 32
            var randomBytes: [UInt8] = [UInt8](repeating: 0, count: bytesCount)
                    rawValue = [UInt8](repeating: 0, count: bytesCount)
            // Generate 32 bytes of randomness with Apple crypto api
            guard SecRandomCopyBytes(kSecRandomDefault, bytesCount, &randomBytes) == errSecSuccess else {
                return
            }
            var sk = blst_scalar()
            // Generate a 256-bit structure
            blst_keygen(&sk, &randomBytes[0], bytesCount, nil, 0)
            // Serialize the scalar structure
            blst_lendian_from_scalar(&self.rawValue[0], &sk)
        }
        
        public var publicKey: Blst.PublicKey {
            get {
                return PublicKey(privateKey: self.rawValue)
            }
        }
        
        public var hexString: String {
            get {
                return Data(self.rawValue).toHex()
            }
        }
    }
    
    public struct PublicKey {
        var rawValue: [UInt8]
        
        public init(privateKey: [UInt8]) {
            var sk = privateKey
            var scalarkey = blst_scalar()
             blst_scalar_from_lendian(&scalarkey, &sk)
            var pk = blst_p1_affine()
            // Get another wild scalar structure
             blst_sk_to_pk2_in_g1(nil, &pk, &scalarkey)
            self.rawValue = [UInt8](repeating: 0, count: 48)
            // Serialize it into bytes
            blst_p1_affine_compress(&self.rawValue, &pk)
        }
        
        public var hexString: String {
            get {
                return Data(self.rawValue).toHex()
            }
        }
    }
}
