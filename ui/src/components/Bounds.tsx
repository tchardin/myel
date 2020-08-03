import * as React from 'react';
import {View, StyleSheet} from 'react-native';

const Bounds: React.FC = ({children}) => {
  return <View style={[styles.base]} children={children} />;
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'flex-start',
  },
});

export default Bounds;
