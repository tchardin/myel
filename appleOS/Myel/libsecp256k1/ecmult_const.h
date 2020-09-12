//
//  ecmult_const.h
//  Myel
//
//  Created by Thomas Chardin on 9/12/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef ecmult_const_h
#define ecmult_const_h

#include "scalar.h"
#include "group.h"

static void secp256k1_ecmult_const(secp256k1_gej *r, const secp256k1_ge *a, const secp256k1_scalar *q);

#endif /* ecmult_const_h */
