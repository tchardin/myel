//
//  ContentView.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var state: UserData
    var body: some View {
        VStack {
            if self.state.screen == "Intro" {
                WalletIntroView()
                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
            }
            if self.state.screen == "Address" {
                WalletAddressView()
                    .transition(.move(edge: .trailing))
            }
        }
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
