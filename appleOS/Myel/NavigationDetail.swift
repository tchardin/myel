//
//  NavigationDetail.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct NavigationDetail: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack(spacing: 24) {
                SearchBar(text: .constant(""), placeholder: "Search")
                    .frame(width: 400)
                    Spacer()
                    Image(nsImage: NSImage(named: NSImage.infoName)!)
                    Image(nsImage: NSImage(named: NSImage.statusAvailableName)!)
                }
                VStack(alignment: .leading) {
                    Text("Performance Summary").font(.largeTitle)
                    Text("Lay back and watch your Filecoin grow")
                }
            }
            .padding()
        }
    }
}

struct NavigationDetail_Previews: PreviewProvider {
    static var previews: some View {
        NavigationDetail()
    }
}
