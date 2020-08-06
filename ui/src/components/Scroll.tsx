import * as React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

type ScrollProps = {
  center?: boolean;
};

const Scroll: React.FC<ScrollProps> = ({children, center}) => {
  return (
    <ScrollView
      contentContainerStyle={[styles.base, center && styles.centerContent]}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: '100%',
  },
  centerContent: {
    alignItems: 'center',
  },
});

export default Scroll;
