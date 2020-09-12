//
//  scalar_8x32.h
//  Myel
//
//  Created by Thomas Chardin on 9/12/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef scalar_8x32_h
#define scalar_8x32_h

#include <stdint.h>

/** A scalar modulo the group order of the secp256k1 curve. */
typedef struct {
    uint32_t d[8];
} secp256k1_scalar;

#define SECP256K1_SCALAR_CONST(d7, d6, d5, d4, d3, d2, d1, d0) {{(d0), (d1), (d2), (d3), (d4), (d5), (d6), (d7)}}

#endif /* scalar_8x32_h */
