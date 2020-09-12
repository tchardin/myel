//
//  WalletAddressView.swift
//  Myel
//
//  Created by Thomas Chardin on 9/7/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI
import CoreImage.CIFilterBuiltins

struct WalletAddressView: View {
    @EnvironmentObject var state: UserData
    
    let context = CIContext()
    let filter = CIFilter.qrCodeGenerator()
    
    func generateQRCode(from string: String) -> NSImage {
        let data = Data(string.utf8)
        filter.setValue(data, forKey: "inputMessage")
        
        if let outputImage = filter.outputImage {
            if let cgimg = context.createCGImage(outputImage, from: outputImage.extent) {
                return NSImage(cgImage: cgimg, size: .zero)
            }
        }
        
        return NSImage(named: NSImage.cautionName) ?? NSImage()
    }
    
    var body: some View {
        VStack {
            VStack(alignment: .leading, spacing: 16) {
                Text("Addresses").font(.largeTitle)
                TabView {
                    VStack(spacing: 24) {
                        Image(nsImage: generateQRCode(from: self.state.wallet.secpAddr.string))
                            .interpolation(.none)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 200, height: 200)
                        Text(self.state.wallet.secpAddr.string)
                    }
                   .padding(16)
                    .tabItem {
                        Text("Standard").font(.title)
                    }
                    VStack(spacing: 24) {
                        Image(nsImage: generateQRCode(from: self.state.wallet.blsAddr.string))
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200, height: 200)
                        Text(self.state.wallet.blsAddr.string)
                    }
                    .padding(16)
                    .tabItem {
                        Text("Blast").font(.title)
                    }
                }
            }.padding(40)
        }.frame(minWidth: 800, minHeight: 600)
    }
}

struct WalletAddressView_Previews: PreviewProvider {
    static var previews: some View {
        WalletAddressView()
    }
}
