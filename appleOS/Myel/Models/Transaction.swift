//
//  Transaction.swift
//  Myel
//
//  Created by Thomas Chardin on 9/3/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct Transaction: Hashable, Codable, Identifiable {
    var id: Int
    var filAmount: String
    var dolAmount: String
    var date: String
    var type: TransactionType
    
    enum TransactionType: String, CaseIterable, Codable, Hashable {
        case retrieval = "Retrieval"
        case withdrawal = "Withdrawal"
        case deposit = "Deposit"
    }
}
