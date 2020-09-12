//
//  basic-config.h
//  Myel
//
//  Created by Thomas Chardin on 9/12/20.
//  Copyright © 2020 Myel. All rights reserved.
//

#ifndef basic_config_h
#define basic_config_h

#ifdef USE_BASIC_CONFIG

#undef USE_ASM_X86_64
#undef USE_ENDOMORPHISM
#undef USE_FIELD_10X26
#undef USE_FIELD_5X52
#undef USE_FIELD_INV_BUILTIN
#undef USE_FIELD_INV_NUM
#undef USE_NUM_GMP
#undef USE_NUM_NONE
#undef USE_SCALAR_4X64
#undef USE_SCALAR_8X32
#undef USE_SCALAR_INV_BUILTIN
#undef USE_SCALAR_INV_NUM

#define USE_NUM_NONE 1
#define USE_FIELD_INV_BUILTIN 1
#define USE_SCALAR_INV_BUILTIN 1
#define USE_FIELD_10X26 1
#define USE_SCALAR_8X32 1

#endif // USE_BASIC_CONFIG

#endif /* basic_config_h */
