//
//  Address.swift
//  Myel
//
//  Created by Thomas Chardin on 9/6/20.
//  Copyright © 2020 Myel. All rights reserved.
//
// Swift version of https://github.com/filecoin-project/go-address/blob/master/address.go

import Foundation
import VarInt

let MainnetPrefix = "f"

let TestnetPrefix = "t"
// PayloadHashLength defines the hash length taken over addresses using the Actor and SECP256K1 protocols.
let PayloadHashLength = 20
// Defines the hash length for calculating address checksums
let ChecksumHashLength = 4
//
let BlsPublicKeyBytes = 48
//
let BlsPrivateKeyBytes = 32

public func hashSum(ingest: [UInt8], len: Int) -> [UInt8] {
   //let h = blake2Hash(input: Data(ingest), key: Data(), outputlen: len)
    var h = [UInt8](repeating: 0, count: len)
    let keyLen: size_t = 0
    blake2b(&h, len, ingest, ingest.count, nil, keyLen)
    return [UInt8](h)
}

enum AddressProtocol: UInt8 {
    case ID = 0
    case SECP256K1 = 1
    case Actor = 2
    case BLS = 3
    case Unknown = 255
}

protocol FilAddress {
    var rawValue: [UInt8] { get set }
}

extension FilAddress {
    // Payload returns initial address value without protocol enum
    var payload: [UInt8] {
        get {
            return Array(self.rawValue.suffix(from: 1))
        }
    }
    // String returns address encoded as a string
    var string: String {
        get {
            // Need to find best way to switch
            let ntwk = TestnetPrefix
            var strAddr = ""
            switch self.protocol {
                case .SECP256K1, .Actor, .BLS:
                    let checksum = hashSum(ingest: self.rawValue, len: ChecksumHashLength)
                    let uintData = self.payload + checksum
                    // Not sure if it might be more reliable to use native lib and cleanup the string after
//                    let tr = SecEncodeTransformCreate(kSecBase32Encoding, nil)!
//                    SecTransformSetAttribute(tr, kSecTransformInputAttributeName, Data(uintData) as CFTypeRef, nil)
//                    let encoded = SecTransformExecute(tr, nil)
//                    let result = String(decoding: encoded as! Data, as: UTF8.self)
//                    let formatted = result.lowercased()
                    let addrEncoded = base32Encode(uintData)
                    
                    strAddr = ntwk + String(self.protocol.rawValue) + addrEncoded
                    return strAddr
                case .ID:
                    let (id, _) = uVarInt(self.payload)
                    strAddr = ntwk + String(self.protocol.rawValue) + String(id)
                    return strAddr
                default:
                    return strAddr
            }
        }
    }
    // Returns the protocol used by the address
    var `protocol`: AddressProtocol {
        get {
            return AddressProtocol(rawValue: self.rawValue[0])!
        }
    }
}

public enum Address {
    public struct Secp256k1: FilAddress {
        var rawValue: [UInt8]
        
        public init(pubkey: [UInt8]) {
            if pubkey.count != PayloadHashLength {
                // Handle errors
                rawValue = [UInt8]()
            }
            let h = hashSum(ingest: pubkey, len: PayloadHashLength)
            // First byte is the protocol enum
            rawValue = [AddressProtocol.SECP256K1.rawValue] + h
        }
    }
    
    public struct BLS: FilAddress {
        var rawValue: [UInt8]
        
        public init(pubkey: [UInt8]) {
            if pubkey.count != BlsPublicKeyBytes {
                // TODO handle bad values
                rawValue = [UInt8]()
            }
            rawValue = [AddressProtocol.BLS.rawValue] + pubkey
        }
    }
    
    public struct ID: FilAddress {
        var rawValue: [UInt8]
        
        public init(id: UInt64) {
            // TODO validate
            let addr = putUVarInt(id)
            rawValue = [AddressProtocol.ID.rawValue] + addr
        }
    }
}
