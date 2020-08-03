import * as React from 'react';
import {memo} from 'react';
import {Text as RNText, StyleSheet, TextStyle} from 'react-native';
import {useTheme} from '../theme';

type TextProps = {
  is: 'body' | 'label' | 'h1' | 'h2' | 'h3' | 'balance' | 'sups';
  children: string | React.ReactNode;
  style?: TextStyle;
  nativeID?: string;
};

const roles = {
  title: 'heading',
  label: 'label',
  body: 'text',
};

const levels = {
  h1: 1,
  h2: 2,
  h3: 3,
  body: undefined,
  label: undefined,
  balance: undefined,
  sups: undefined,
};

const Text: React.FC<TextProps> = memo(({is, children, style, nativeID}) => {
  const {theme} = useTheme();
  return (
    <RNText
      nativeID={nativeID}
      style={[theme.text, styles[is], style]}
      // @ts-ignore: web props
      accessibilityRole={roles[is]}
      aria-level={levels[is]}>
      {children}
    </RNText>
  );
});

const styles = StyleSheet.create({
  h1: {
    fontWeight: '700',
    fontSize: 48,
  },
  h2: {
    fontWeight: '700',
    fontSize: 32,
  },
  h3: {
    fontWeight: '700',
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  balance: {
    fontSize: 32,
    // @ts-ignore: web feature
    fontFeatureSettings: "'tnum' 1, 'zero' 1",
  },
  sups: {
    // @ts-ignore: web feature
    fontFeatureSettings: "'kern' 1, 'sups' 1",
    textAlignVertical: 'top',
  },
  body: {},
});

export default Text;
