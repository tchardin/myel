import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import Switch from './Switch';

const Banner: React.FC = () => {
  const {theme, colorScheme, toggleTheme} = useTheme();
  return (
    <View
      // @ts-ignore: web role
      accessibilityRole="banner"
      style={[styles.container, theme.bg]}>
      <View style={styles.right}>
        <Switch
          value={colorScheme === 'dark'}
          onValueChange={toggleTheme}
          label="Change color scheme"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: '100%',
    paddingLeft: 40,
    paddingRight: 40,
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default Banner;
