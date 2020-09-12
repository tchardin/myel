//
//  UserData.swift
//  Myel
//
//  Created by Thomas Chardin on 9/3/20.
//  Copyright © 2020 Myel. All rights reserved.
//

import Combine
import SwiftUI

final class UserData: ObservableObject {
    @Published var transactions = transactionData
    @Published var screen = "Intro"
    @Published var wallet = Wallet()
}
