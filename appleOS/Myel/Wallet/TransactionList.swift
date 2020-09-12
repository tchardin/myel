//
//  TransactionList.swift
//  Myel
//
//  Created by Thomas Chardin on 9/3/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct TransactionList: View {
    @EnvironmentObject private var userData: UserData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Transactions")
                .font(.caption)
            List {
                ForEach(userData.transactions) { transaction in
                    TransactionRow(transaction: transaction)
                }
            }.listStyle(SidebarListStyle())
                .frame(height: 230)
            Button("Show more", action: {
                
                }).buttonStyle(NeoButtonStyle())
        }
    }
}

struct TransactionList_Previews: PreviewProvider {
    static var previews: some View {
        TransactionList()
        .environmentObject(UserData())
    }
}
