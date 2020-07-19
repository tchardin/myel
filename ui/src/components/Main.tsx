import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme';

const Main: React.FC = ({children}) => {
  const {theme} = useTheme();
  return (
    <View
      style={[styles.base, theme.bg]}
      // @ts-ignore: web props
      accessibilityRole="main">
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
});

export default Main;
