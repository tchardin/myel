//
//  BalanceRow.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct BalanceRow: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            VStack(alignment: .leading, spacing: 8) {
            Text("Balance")
                .font(.caption)
            HStack(alignment: .top) {
                Text("⨎")
                    .font(.footnote)
                Text("1,287.1454")
                    .font(.title)
            }
            Text("$10,154.91")
                .font(.footnote)
                .opacity(0.625)
            }
            HStack(spacing: 16) {
                Button(action: {
                    
                }) {
                    HStack(spacing: 8) {
                        Image("withdraw")
                        .resizable()
                        .frame(width: 16, height: 16)
                        Text("Widthdraw")
                    }
                }.buttonStyle(NeoButtonStyle())
                Button(action: {
                    
                }) {
                    HStack(spacing: 8) {
                        Image("deposit")
                        .resizable()
                        .frame(width: 16, height: 16)
                        Text("Deposit")
                    }
                }.buttonStyle(NeoButtonStyle())
            }
        }
    }
}

struct BalanceRow_Previews: PreviewProvider {
    static var previews: some View {
        BalanceRow()
        .padding()
    }
}
