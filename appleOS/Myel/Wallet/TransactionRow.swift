//
//  TransactionRow.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct TransactionRow: View {
    var transaction: Transaction
    
    var body: some View {
        HStack(spacing: 16) {
            Image(selectIcon())
                .resizable()
                .frame(width: 16, height: 16)
            VStack(alignment: .leading, spacing: 4) {
                Text(selectLabel(id: transaction.id))
                Text(transaction.date)
                    .font(.caption)
                    .opacity(0.625)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text("$\(transaction.filAmount)FIL")
                    .fontWeight(.bold)
                Text("$$\(transaction.dolAmount)")
                    .font(.caption)
                    .opacity(0.625)
            }
        }.padding(.vertical, 16)
    }
    
    func selectLabel(id: Int) -> String {
        switch transaction.type {
        case .deposit: return "Deposit: #$\(id)"
        case .withdrawal: return "Withdrawal: #$\(id)"
        case .retrieval: return "Retrieval: #$\(id)"
        }
    }
    
    func selectIcon() -> String {
        switch transaction.type {
        case .deposit: return "depositTx"
        case .withdrawal: return "withdrawTx"
        case .retrieval: return "retrievalTx"
        }
    }
}

struct TransactionRow_Previews: PreviewProvider {
    static var previews: some View {
        TransactionRow(transaction: transactionData[0])
    }
}
