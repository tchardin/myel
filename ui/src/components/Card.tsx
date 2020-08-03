import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme';

const Card: React.FC = ({children}) => {
  const {theme} = useTheme();
  return <View style={[styles.base, theme.neoCard]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 50,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
});

export default Card;
