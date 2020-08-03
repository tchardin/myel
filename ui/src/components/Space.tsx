import * as React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

type SpaceProps = {
  scale?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  style?: ViewStyle;
  children?: React.ReactElement | React.ReactNode | React.ReactNode[] | boolean;
};

const Space = ({style, scale, children, ...props}: SpaceProps) => {
  const items = React.Children.toArray(children);
  return (
    <>
      {React.Children.map(items, (c, i) => (
        <View
          key={`space-${i}`}
          style={[styles.base, getStyle(styles, scale), style]}
          children={c}
          {...props}
        />
      ))}
    </>
  );
};

const getStyle = (s: any, scale: number | undefined) => {
  switch (scale) {
    case 0:
      return s.gutter0;
    case 1:
      return s.gutter1;
    case 2:
      return s.gutter2;
    case 3:
      return s.gutter3;
    case 4:
      return s.gutter4;
    case 5:
      return s.gutter5;
    case 6:
      return s.gutter6;
    case 7:
      return s.gutter7;
    default:
      return undefined;
  }
};
const scale = [0, 4, 8, 12, 16, 24, 32, 40];
const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'flex-start',
  },
  gutter0: {
    marginBottom: scale[0],
  },
  gutter1: {
    marginBottom: scale[1],
  },
  gutter2: {
    marginBottom: scale[2],
  },
  gutter3: {
    marginBottom: scale[3],
  },
  gutter4: {
    marginBottom: scale[4],
  },
  gutter5: {
    marginBottom: scale[5],
  },
  gutter6: {
    marginBottom: scale[6],
  },
  gutter7: {
    marginBottom: scale[7],
  },
});

export default Space;
