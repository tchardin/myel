//
//  WalletIntroView.swift
//  Myel
//
//  Created by Thomas Chardin on 9/4/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct WalletIntroView: View {
    @EnvironmentObject  var state: UserData
    var body: some View {
        VStack {
            VStack(spacing: 24) {
                Text("Wallet setup").font(.largeTitle)
                Divider()
                Text("Save this phrase somewhere secure, it can be used to recover your wallet").font(.system(.subheadline))
                GroupBox {
                    Text(self.state.wallet.mm)
                        .padding(16)
                }
                Button("Continue", action: {
                    withAnimation {
                        self.state.screen = "Address"
                    }
                })
            }.padding(40)
        }.frame(minWidth: 800, minHeight: 600)
    }
}

struct WalletIntroView_Previews: PreviewProvider {
    static var previews: some View {
        WalletIntroView()
    }
}
