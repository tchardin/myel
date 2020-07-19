import * as React from 'react';
import {Text as RNText, StyleSheet, TextStyle} from 'react-native';
import {useTheme} from '../theme';

type TextProps = {
  is: 'body' | 'title' | 'label';
  children: string | React.ReactNode;
  style?: TextStyle;
  nativeID?: string;
};

const roles = {
  title: 'heading',
  label: 'label',
  body: 'text',
};

const Text: React.FC<TextProps> = ({is, children, style, nativeID}) => {
  const {theme} = useTheme();
  return (
    <RNText
      nativeID={nativeID}
      style={[theme.text, styles[is], style]}
      // @ts-ignore: web props
      accessibilityRole={roles[is]}
      aria-level={is === 'title' ? 1 : undefined}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
    fontSize: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  body: {},
});

export default Text;
