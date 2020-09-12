//
//  blake2b.h
//  Myel
//
//  Created by Thomas Chardin on 9/9/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef blake2b_h
#define blake2b_h

#include <stddef.h>
#include <stdint.h>

#if defined(_MSC_VER)
#define BLAKE2_PACKED(x) __pragma(pack(push, 1)) x __pragma(pack(pop))
#else
#define BLAKE2_PACKED(x) x __attribute__((packed))
#endif

#if defined(__cplusplus)
extern "C" {
#endif

enum blake2b_constant
{
  BLAKE2B_BLOCKBYTES = 128,
  BLAKE2B_OUTBYTES   = 64,
  BLAKE2B_KEYBYTES   = 64,
  BLAKE2B_SALTBYTES  = 16,
  BLAKE2B_PERSONALBYTES = 16
};

typedef struct blake2b_state__
{
  uint64_t h[8];
  uint64_t t[2];
  uint64_t f[2];
  uint8_t  buf[BLAKE2B_BLOCKBYTES];
  size_t   buflen;
  size_t   outlen;
  uint8_t  last_node;
} blake2b_state;

BLAKE2_PACKED(struct blake2b_param__
{
  uint8_t  digest_length; /* 1 */
  uint8_t  key_length;    /* 2 */
  uint8_t  fanout;        /* 3 */
  uint8_t  depth;         /* 4 */
  uint32_t leaf_length;   /* 8 */
  uint32_t node_offset;   /* 12 */
  uint32_t xof_length;    /* 16 */
  uint8_t  node_depth;    /* 17 */
  uint8_t  inner_length;  /* 18 */
  uint8_t  reserved[14];  /* 32 */
  uint8_t  salt[BLAKE2B_SALTBYTES]; /* 48 */
  uint8_t  personal[BLAKE2B_PERSONALBYTES];  /* 64 */
});

typedef struct blake2b_param__ blake2b_param;

/* Padded structs result in a compile-time error */
enum {
  BLAKE2_DUMMY_2 = 1/(sizeof(blake2b_param) == BLAKE2B_OUTBYTES)
};

  int blake2b( void *out, size_t outlen, const void *in, size_t inlen, const void *key, size_t keylen );


#endif /* blake2b_h */
