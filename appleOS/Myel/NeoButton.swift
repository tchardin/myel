//
//  NeoButton.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct NeoButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
        .padding(10)
        .padding(.horizontal, 12)
        .background(
                    ZStack {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .shadow(
                                color: .white,
                                radius: configuration.isPressed ? 6 : 12,
                                x: configuration.isPressed ? -2 : -4,
                                y: configuration.isPressed ? -2 : -4
                            )
                            .shadow(
                                color: .black,
                                radius: configuration.isPressed ? 6 : 12,
                                x: configuration.isPressed ? 2 : 4,
                                y: configuration.isPressed ? 2 : 4
                            )
                            .blendMode(.overlay)
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(Color(NSColor.windowBackgroundColor))
                    }
                )
        .foregroundColor(.primary)
    }
}

struct NeoButton: View {
    var title: String;
    
    var body: some View {
        Button(title, action: {
            
            })
        .buttonStyle(NeoButtonStyle())
            
    }
}

struct NeoButton_Previews: PreviewProvider {
    static var previews: some View {
        NeoButton(title: "Press me")
        .padding()
    }
}
