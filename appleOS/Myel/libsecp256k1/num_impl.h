//
//  num_impl.h
//  Myel
//
//  Created by Thomas Chardin on 9/12/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef num_impl_h
#define num_impl_h

#if defined HAVE_CONFIG_H
#include "libsecp256k1-config.h"
#endif

#include "num.h"

#if defined(USE_NUM_GMP)
#include "num_gmp_impl.h"
#elif defined(USE_NUM_NONE)
/* Nothing. */
#else
#error "Please select num implementation"
#endif

#endif /* num_impl_h */
