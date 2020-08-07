import * as React from 'react';
import {View, StyleSheet} from 'react-native';

type BoundsProps = {
  wide?: boolean;
};

const Bounds: React.FC<BoundsProps> = ({children, wide}) => {
  return (
    <View style={[styles.base, wide && styles.wide]} children={children} />
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'flex-start',
  },
  wide: {
    maxWidth: 800,
  },
});

export default Bounds;
