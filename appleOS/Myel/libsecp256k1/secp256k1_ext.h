//
//  secp256k1_ext.h
//  Myel
//
//  Created by Thomas Chardin on 9/12/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef secp256k1_ext_h
#define secp256k1_ext_h

#include "secp256k1.h"

SECP256K1_API int secp256k1_ext_scalar_mul(
    const secp256k1_context* ctx,
    unsigned char *point,
    const unsigned char *scalar
) SECP256K1_ARG_NONNULL(1) SECP256K1_ARG_NONNULL(2) SECP256K1_ARG_NONNULL(3);

#endif /* secp256k1_ext_h */
