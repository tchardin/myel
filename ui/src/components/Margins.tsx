import * as React from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';
import {useBreakpoint} from '../hooks/useBreakpoint';

const Margins: React.FC<ViewProps> = ({style, ...props}) => {
  const {index} = useBreakpoint();
  return <View {...props} style={[margins[index], style]} />;
};

const styles = StyleSheet.create({
  xxs: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  xs: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  s: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  m: {
    paddingLeft: 40,
    paddingRight: 40,
  },
});

const margins = [styles.xxs, styles.xs, styles.s, styles.m, styles.m, styles.m];

export default Margins;
