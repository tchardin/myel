//
//  ecdsa.h
//  Myel
//
//  Created by Thomas Chardin on 9/12/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef ecdsa_h
#define ecdsa_h

#include <stddef.h>

#include "scalar.h"
#include "group.h"
#include "ecmult.h"

static int secp256k1_ecdsa_sig_parse(secp256k1_scalar *r, secp256k1_scalar *s, const unsigned char *sig, size_t size);
static int secp256k1_ecdsa_sig_serialize(unsigned char *sig, size_t *size, const secp256k1_scalar *r, const secp256k1_scalar *s);
static int secp256k1_ecdsa_sig_verify(const secp256k1_ecmult_context *ctx, const secp256k1_scalar* r, const secp256k1_scalar* s, const secp256k1_ge *pubkey, const secp256k1_scalar *message);
static int secp256k1_ecdsa_sig_sign(const secp256k1_ecmult_gen_context *ctx, secp256k1_scalar* r, secp256k1_scalar* s, const secp256k1_scalar *seckey, const secp256k1_scalar *message, const secp256k1_scalar *nonce, int *recid);


#endif /* ecdsa_h */
