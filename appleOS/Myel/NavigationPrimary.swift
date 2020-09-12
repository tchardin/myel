//
//  NavigationPrimary.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct NavigationPrimary: View {
    
    var body: some View {
        VStack(alignment: .leading, spacing: 40) {
            ProfileRow()
            BalanceRow()
            TransactionList()
        }.padding()
            .frame(minWidth: 300)
    }
}

struct NavigationPrimary_Previews: PreviewProvider {
    static var previews: some View {
        NavigationPrimary()
        .environmentObject(UserData())
    }
}
