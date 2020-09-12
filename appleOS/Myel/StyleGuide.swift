//
//  StyleGuide.swift
//  Myel
//
//  Created by Thomas Chardin on 9/4/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct StyleGuide: View {
    @State var fieldValue1: String = ""
      @State var fieldValue2: String = ""
      @State var toggleOnValue1: Bool = false
      @State var toggleOnValue2: Bool = false
      @State var selectedValue1 = PickerValue.second
      @State var sliderValue1: Double = 0
      @State var stepperValue1 = 10
      
      @State var showingAlert = false
      @State var showingActionSheet = false

      enum PickerValue: String, CaseIterable, Identifiable {
          case first
          case second
          case third
          case last
          
          var id: String { self.rawValue }
      }
    var body: some View {
        NavigationView() {
            VStack(alignment: .leading, spacing: 24) {
                Text("Large Title").font(.largeTitle)
                Text("Title").font(.system(.title))
                Text("Headline").font(.system(.headline))
                Text("Subheadline").font(.system(.subheadline))
                Text("Body")
                Text("Callout").font(.system(.callout))
                Text("Footnote").font(.system(.footnote))
                Text("Caption").font(.system(.caption))
            }.padding()
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    
                    TextField("Rounded text field", text: $fieldValue1)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    SecureField("Password field", text: $fieldValue2)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button("Show Alert", action: {
                        self.showingAlert = true
                    })
                        .alert(isPresented: $showingAlert) {
                            Alert(title: Text("Important message"), message: Text("Don't forget to do something"), dismissButton: .default(Text("Got it")))
                    }
                    Button("Plain", action: { })
                    .buttonStyle(PlainButtonStyle())
                    Button("Link", action: { })
                    .buttonStyle(LinkButtonStyle())
                    
                    Toggle(toggleOnValue1 ? "Turn off" : "Turn on", isOn: $toggleOnValue1)
                    Toggle("Turn on", isOn: $toggleOnValue2)
                    .toggleStyle(SwitchToggleStyle())
                    .labelsHidden()
                    
                    Picker("Items", selection: $selectedValue1) {
                        ForEach(PickerValue.allCases) { rank in
                            Text(rank.rawValue.capitalized).tag(rank)
                        }
                    }
                    
                    Slider(value: $sliderValue1, in: 0...100, step: 1)
                    
                    Stepper("Increment value", value: $stepperValue1, in: 0...100)
                }.padding()
            }
        }
    }
}

struct StyleGuide_Previews: PreviewProvider {
    static var previews: some View {
        StyleGuide()
    }
}
