import * as React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

const Scroll: React.FC = ({children}) => {
  return (
    <ScrollView contentContainerStyle={styles.base}>{children}</ScrollView>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: '100%',
  },
});

export default Scroll;
