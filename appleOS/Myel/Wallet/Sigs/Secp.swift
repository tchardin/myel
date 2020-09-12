//
//  Secp.swift
//  Myel
//
//  Created by Thomas Chardin on 9/5/20.
//  Copyright © 2020 Myel. All rights reserved.
//
// This signature is used to authenticate blockchain transactions.
// It enables interoperability with other blockchains such as Bitcoin.
// Also one can recover the public key from a given signature saving space on the blockchain.

import CryptoKit
import Foundation

let senderSigningKey = Curve25519.Signing.PrivateKey()

public enum Secp256k1 {
    public struct PrivateKey {
        public let rawValue: [UInt8]
        
        init() {
            let ctx = secp256k1_context_create(UInt32(UInt(SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY)))
            let bytesCount = 32
            var randomBytes: [UInt8] = [UInt8](repeating: 0, count: bytesCount)
            repeat {
                _ = SecRandomCopyBytes(kSecRandomDefault, bytesCount, &randomBytes)
            } while secp256k1_ec_seckey_verify(ctx!, &randomBytes) != Int32(1)
            
            rawValue = randomBytes
        }
        
        init(_ raw: [UInt8]) {
            rawValue = raw
        }
        
        public var publicKey: Secp256k1.PublicKey? {
            get {
                do {
                    return try PublicKey(privateKey: self.rawValue, ctx: nil)
                } catch {
                    return nil
                }
            }
        }
        
        public var hexString: String {
            get {
                return Data(self.rawValue).toHex()
            }
        }
    }
    
    public struct PublicKey {
        private let context: OpaquePointer
        public let rawValue: [UInt8]
        
        public init(privateKey: [UInt8], ctx: OpaquePointer?) throws {
            context = ctx ?? secp256k1_context_create(UInt32(UInt(SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY)))
            let bx: [UInt8] = [121, 190, 102, 126, 249, 220, 187, 172, 85, 160, 98, 149, 206, 135, 11, 7, 2, 155, 252, 219, 45, 206, 40, 217, 89, 242, 129, 91, 22, 248, 23, 152]
            let by: [UInt8] = [72, 58, 218, 119, 38, 163, 196, 101, 93, 164, 251, 252, 14, 17, 8, 168, 253, 23, 180, 72, 166, 133, 84, 25, 156, 71, 208, 143, 251, 16, 212, 184]
            var scalar = privateKey
            
            // Could optionally pad it but isn't necessary for our needs I think
            // var padded = [UInt8](repeating: 0, 32)
            
            var point = bx + by
            
            let res = secp256k1_ext_scalar_mul(context, &point, &scalar)
            
            if res != 1 {
                // Todo handle errors
                print("Scalar multiplication failed")
            }
            
            let byteLen = 32
            var ret = [UInt8](repeating: 0, count: 1+2*byteLen)
            ret[0] = 4
            
            for (i, p) in point.enumerated() {
                ret[i + 1] = p
            }
            secp256k1_context_destroy(ctx)
            rawValue = ret
        }
        
        public var hexString: String {
            get {
                return Data(self.rawValue).toHex()
            }
        }
    }
    
    enum SigningError: Error {
        case invalidPrivateKey
        case invalidPublicKey
        case invalidSignature
    }
}

extension Secp256k1.PrivateKey {
    public func signature(for data: [UInt8]) throws -> [UInt8] {
        let ctx = secp256k1_context_create(UInt32(SECP256K1_CONTEXT_SIGN))
        let hashLen = 32
        let b2sum = hashSum(ingest: data, len: hashLen)
        
        var sigstruct = secp256k1_ecdsa_recoverable_signature()
        let noncefunc = secp256k1_nonce_function_rfc6979
        var msgData = b2sum
        secp256k1_ecdsa_sign_recoverable(ctx!, &sigstruct, &msgData, self.rawValue, noncefunc, nil)
        
        var sig = [UInt8](repeating: 0, count: 65)
        var recid: Int32 = 0
        secp256k1_ecdsa_recoverable_signature_serialize_compact(ctx!, &sig, &recid, &sigstruct)
        sig[64] = UInt8(recid)
        secp256k1_context_destroy(ctx)
        return sig
    }
}

extension Secp256k1.PublicKey {
    public func isValidSignature(_ signature: [UInt8], for data: [UInt8]) throws -> Bool {
        let ctx = secp256k1_context_create(UInt32(SECP256K1_CONTEXT_VERIFY))
        let hashLen = 32
        let b2sum = hashSum(ingest: data, len: hashLen)
        
        var sigData = signature
        if sigData.count == 65 {
            // Drop the V (1byte) in [R | S | V] style signatures.
            // The V (1byte) is the recovery bit and is not apart of the signature verification.
            _ = sigData.popLast()
        }
        
        var sig = secp256k1_ecdsa_signature()
        guard secp256k1_ecdsa_signature_parse_compact(ctx!, &sig, sigData) == 1 else {
            secp256k1_context_destroy(ctx)
            return false
        }
        
        var pubKey = secp256k1_pubkey()
        guard secp256k1_ec_pubkey_parse(ctx!, &pubKey, self.rawValue, self.rawValue.count) == 1 else {
            secp256k1_context_destroy(ctx)
            return false
        }
        guard secp256k1_ecdsa_verify(ctx!, &sig, b2sum, &pubKey) == 1 else {
            secp256k1_context_destroy(ctx)
            return false
        }
        
        return true
    }
}

extension UInt8 {
    static func fromHex(hexString: String) -> UInt8 {
        return UInt8(strtoul(hexString, nil, 16))
    }
}

extension StringProtocol {
    var toBytes: [UInt8] {
        let hexa = Array(self)
        return stride(from: 0, to: count, by: 2).compactMap {
            UInt8.fromHex(hexString: String(hexa[$0..<$0.advanced(by: 2)]))
        }
    }
}
