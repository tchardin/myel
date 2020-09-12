//
//  SearchBar.swift
//  Myel
//
//  Created by Thomas Chardin on 9/2/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import SwiftUI

struct SearchBar: NSViewRepresentable {
    typealias NSViewType = NSSearchField
    
    @Binding var text: String
    var placeholder: String
    
    class Coordinator: NSObject, NSSearchFieldDelegate {
        @Binding var text: String
        init(text: Binding<String>) {
            _text = text
        }
        
        func searchFieldDidStartSearching(_ sender: NSSearchField) {
            
        }
        func searchFieldDidEndSearching(_ sender: NSSearchField) {
            
        }
    }
    
    func makeCoordinator() -> SearchBar.Coordinator {
        return Coordinator(text: $text)
    }
    
    func makeNSView(context: Context) -> NSSearchField {
        let searchBar = NSSearchField()
        searchBar.delegate = context.coordinator
        searchBar.placeholderString = placeholder
        return searchBar
    }
    
    func updateNSView(_ nsView: NSSearchField, context: Context) {
        nsView.stringValue = text
    }
}

struct SearchBar_Previews: PreviewProvider {
    static var previews: some View {
        SearchBar(text: .constant(""), placeholder: "Search")
    }
}
