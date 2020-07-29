import React, {createContext, useState, useMemo, useContext} from 'react';
import {
  useColorScheme,
  StyleSheet,
  TextStyle,
  StyleProp,
  ImageStyle,
} from 'react-native';

const transitions = {
  default: 'all 200ms cubic-bezier(0.02, 0.01, 0.47, 1)',
};

const colors = {
  light: {
    text: 'rgba(0, 0, 0, 0.8)',
    subtle: 'rgba(0, 0, 0, 0.4)',
    bg: '#ECF0F3',
    error: '#f95a54',
    success: 'lightgreen',
    tableCell: '#FFFFFF',
  },
  dark: {
    text: 'rgba(255, 255, 255, 0.8)',
    subtle: 'rgba(255, 255, 255, 0.4)',
    bg: '#292D32',
    error: '#c84b47',
    success: 'green',
    tableCell: '#353A40',
  },
};

const baseTheme = StyleSheet.create({
  text: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
  },
});
const lightTheme = StyleSheet.create({
  text: {
    color: colors.light.text,
  },
  bg: {
    backgroundColor: colors.light.bg,
  },
  neoCard: {
    // @ts-ignore: web styles
    boxShadow: '-18px -18px 20px 0 #FFFFFF, 18px 18px 20px 0 #D1D9E6',
    transition: transitions.default,
  },
  neoSwitch: {
    // @ts-ignore: web styles
    boxShadow: 'inset 2px 2px 5px rgba(105, 141, 173, 0.4)',
  },
  neoButton: {
    // @ts-ignore: web styles
    boxShadow: '2px 2px 10px rgba(136, 165, 191, 0.48), -2px -2px 10px #FFFFFF',
    transition: transitions.default,
  },
  neoButtonHovered: {
    // @ts-ignore: web styles
    boxShadow: '4px 2px 16px rgba(136, 165, 191, 0.48), -4px -2px 16px #FFFFFF',
  },
  neoButtonPressed: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 3px 3px 7px rgba(136, 165, 191, 0.48), inset -3px -3px 7px #FFFFFF',
  },
  neoField: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 1px 1px 2px rgba(136, 165, 191, 0.38), inset -1px -1px 2px #FFFFFF',
    transition: transitions.default,
  },
  neoFieldError: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 2px 2px 5px rgba(136, 165, 191, 0.38), inset -3px -3px 7px #FFFFFF,  1px 1px 6px rgba(249, 90, 84, 0.4), -1px -1px 6px rgba(249, 90, 84, 0.4)',
  },
  neoFieldFocused: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 2px 2px 5px rgba(136, 165, 191, 0.38), inset -3px -3px 7px #FFFFFF',
  },
  neoTableCell: {
    backgroundColor: colors.light.tableCell,
  },
});
const darkTheme = StyleSheet.create({
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bg: {
    backgroundColor: colors.dark.bg,
  },
  neoCard: {
    // @ts-ignore: web styles
    boxShadow: '-18px -18px 20px 0 #30343A, 18px 18px 20px 0 #24262B',
    transition: 'all 200ms cubic-bezier(0.02, 0.01, 0.47, 1)',
  },
  neoSwitch: {
    // @ts-ignore: web styles
    boxShadow: 'inset 2px 2px 8px rgba(4, 4, 5, 0.6)',
  },
  neoButton: {
    // @ts-ignore: web styles
    boxShadow:
      '2px 2px 10px rgba(0, 0, 0, 0.5), -2px -2px 10px rgba(195, 200, 205, 0.08)',
    transition: transitions.default,
  },
  neoButtonHovered: {
    // @ts-ignore: web styles
    boxShadow:
      '4px 4px 18px rgba(0, 0, 0, 0.5), -4px -2px 16px rgba(195, 200, 205, 0.08)',
  },
  neoButtonPressed: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 1px 1px 5px #070709, inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
  },
  neoField: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 1px 1px 2px #070709, inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
    transition: transitions.default,
  },
  neoFieldError: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 2px 2px 5px #070709, inset -5px -5px 10px rgba(255, 255, 255, 0.05), 1px 1px 6px rgba(249, 90, 84, 0.4), -1px -1px 6px rgba(249, 90, 84, 0.4)',
  },
  neoFieldFocused: {
    // @ts-ignore: web styles
    boxShadow:
      'inset 2px 2px 5px #070709, inset -5px -5px 10px rgba(255, 255, 255, 0.05)',
  },
  neoTableCell: {
    backgroundColor: colors.dark.tableCell,
  },
});

const themeStyles = {
  light: {
    text: [baseTheme.text, lightTheme.text],
    bg: lightTheme.bg,
    neoCard: lightTheme.neoCard,
    neoSwitch: lightTheme.neoSwitch,
    neoButton: lightTheme.neoButton,
    neoButtonHovered: lightTheme.neoButtonHovered,
    neoButtonPressed: lightTheme.neoButtonPressed,
    neoField: lightTheme.neoField,
    neoFieldError: lightTheme.neoFieldError,
    neoFieldFocused: lightTheme.neoFieldFocused,
    neoTableCell: lightTheme.neoTableCell,
  },
  dark: {
    text: [baseTheme.text, darkTheme.text],
    bg: darkTheme.bg,
    neoCard: darkTheme.neoCard,
    neoSwitch: darkTheme.neoSwitch,
    neoButton: darkTheme.neoButton,
    neoButtonHovered: darkTheme.neoButtonHovered,
    neoButtonPressed: darkTheme.neoButtonPressed,
    neoField: darkTheme.neoField,
    neoFieldError: darkTheme.neoFieldError,
    neoFieldFocused: darkTheme.neoFieldFocused,
    neoTableCell: darkTheme.neoTableCell,
  },
};

type ThemeStyles = {
  [propName: string]: StyleProp<TextStyle | ImageStyle>;
};
export type Colors = {
  [propName: string]: string;
};
type Theme = {
  theme: ThemeStyles;
  colors: Colors;
  toggleTheme: () => void;
  colorScheme: string;
};

const ThemeContext = createContext<Theme>({
  theme: themeStyles.light,
  colors: colors.light,
  colorScheme: 'light',
  toggleTheme: () => {},
});

const ThemeProvider: React.FC = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme || 'light');
  const api = useMemo(
    () => ({
      colorScheme,
      theme: themeStyles[colorScheme] || themeStyles.light,
      colors: colors[colorScheme] || colors.light,
      toggleTheme: () =>
        setColorScheme(colorScheme === 'light' ? 'dark' : 'light'),
    }),
    [colorScheme]
  );
  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  return ctx;
};

export default ThemeProvider;
