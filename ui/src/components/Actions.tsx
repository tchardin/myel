import * as React from 'react';
import {View, StyleSheet} from 'react-native';

const Actions: React.FC = ({children}) => {
  return <View style={styles.base} children={children} />;
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
});

export default Actions;
