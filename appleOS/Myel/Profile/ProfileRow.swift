//
//  ProfileRow.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct ProfileRow: View {
    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .center) {
                Text("(¬‿¬)")
                    .frame(width: 48, height: 48)
                    .font(.system(size: 17, weight: .heavy))
                    .padding()
                    .foregroundColor(.white)
                    .background(Color(NSColor.systemIndigo))
                .clipShape(Circle())
            }
            Text("t0122980")
                .font(.system(size: 18))
        }
    }
}

struct ProfileRow_Previews: PreviewProvider {
    static var previews: some View {
        ProfileRow()
    }
}
