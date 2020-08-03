import * as React from 'react';
import {forwardRef, memo} from 'react';
import {View, StyleSheet, ViewProps, FlexStyle} from 'react-native';

interface LayoutProps extends ViewProps {
  m?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  mx?: number;
  my?: number;
  p?: number;
  pt?: number;
  pr?: number;
  pb?: number;
  pl?: number;
  px?: number;
  py?: number;
  flex?: number;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end';
}

interface StackProps extends LayoutProps {
  children?: any;
}

export const VStack = memo(
  forwardRef<View, StackProps>(({children, ...props}, ref) => {
    const [style, forward] = getLayoutRules(props, 'vertical');
    return (
      <View ref={ref} style={style} {...forward}>
        {children}
      </View>
    );
  })
);

export const HStack = memo(
  forwardRef<View, StackProps>(({children, ...props}, ref) => {
    const [style, forward] = getLayoutRules(props, 'horizontal');
    return (
      <View ref={ref} style={style} {...forward}>
        {children}
      </View>
    );
  })
);

export function getLayoutRules(props: LayoutProps, direction: string) {
  const {
    m,
    mt,
    mr,
    mb,
    ml,
    mx,
    my,
    p,
    pt,
    pr,
    pb,
    pl,
    px,
    py,
    flex,
    justify,
    align,
    ...rest
  } = props;
  const style = [
    direction === 'horizontal' && styles.horizontal,
    styles[`m${m}`],
    styles[`mt${mt}`],
    styles[`mr${mr}`],
    styles[`mb${mb}`],
    styles[`ml${ml}`],
    styles[`mx${mx}`],
    styles[`my${my}`],
    styles[`p${p}`],
    styles[`pt${pt}`],
    styles[`pr${pr}`],
    styles[`pb${pb}`],
    styles[`pl${pl}`],
    styles[`px${px}`],
    styles[`py${py}`],
    styles[`flex${flex}`],
    styles[`${align}Align`],
    styles[`${justify}Justify`],
    props.style,
  ];
  return [style, rest];
}

export const space = [0, 4, 8, 12, 16, 24, 32, 40, 48];

interface PropMap {
  [propName: string]: string;
}

const margin: PropMap = {
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mx: 'marginHorizontal',
  my: 'marginVertical',
};

const padding: PropMap = {
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  px: 'paddingHorizontal',
  py: 'paddingVertical',
};

const createSpaceStyles = (space: number[]) => {
  return space.reduce((styles, size, i) => {
    return {
      ...styles,
      ...Object.keys(margin).reduce((props, k) => {
        return {
          ...props,
          [`${k}${i}`]: {
            [margin[k]]: size,
          },
        };
      }, {}),
      ...Object.keys(padding).reduce((props, k) => {
        return {
          ...props,
          [`${k}${i}`]: {
            [padding[k]]: size,
          },
        };
      }, {}),
    };
  }, {});
};

interface LayoutStyles {
  [propName: string]: FlexStyle;
}

const layoutStyles: LayoutStyles = {
  horizontal: {
    flexDirection: 'row',
  },
  startAlign: {
    alignItems: 'flex-start',
  },
  endAlign: {
    alignItems: 'flex-end',
  },
  centerAlign: {
    alignItems: 'center',
  },
  startJustify: {
    justifyContent: 'flex-start',
  },
  endJustify: {
    justifyContent: 'flex-end',
  },
  centerJustify: {
    justifyContent: 'center',
  },
  betweenJustify: {
    justifyContent: 'space-between',
  },
  aroundJustify: {
    justifyContent: 'space-around',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  flex4: {
    flex: 4,
  },
  flex5: {
    flex: 5,
  },
  flex6: {
    flex: 6,
  },
  flex7: {
    flex: 7,
  },
  flex8: {
    flex: 8,
  },
  flex9: {
    flex: 9,
  },
  flex10: {
    flex: 10,
  },
  ...createSpaceStyles(space),
};

const styles = StyleSheet.create(layoutStyles);
