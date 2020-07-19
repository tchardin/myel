import React, {createContext, useState, useMemo, useContext} from 'react';
import {
  useColorScheme,
  StyleSheet,
  TextStyle,
  StyleProp,
  ImageStyle,
} from 'react-native';

const colors = {
  light: {
    text: 'rgba(0, 0, 0, 0.8)',
    subtle: 'rgba(0, 0, 0, 0.4)',
    bg: '#ECF0F3',
    error: '#f95a54',
    success: 'lightgreen',
  },
  dark: {
    text: 'rgba(255, 255, 255, 0.8)',
    subtle: 'rgba(255, 255, 255, 0.4)',
    bg: '#292D32',
    error: '#c84b47',
    success: 'green',
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
  neoSwitch: {
    // @ts-ignore: web styles
    boxShadow: 'inset 2px 2px 5px rgba(105, 141, 173, 0.4)',
  },
});
const darkTheme = StyleSheet.create({
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bg: {
    backgroundColor: colors.dark.bg,
  },
  neoSwitch: {
    // @ts-ignore: web styles
    boxShadow: 'inset 2px 2px 8px rgba(4, 4, 5, 0.6)',
  },
});

const themeStyles = {
  light: {
    text: [baseTheme.text, lightTheme.text],
    bg: lightTheme.bg,
    neoSwitch: lightTheme.neoSwitch,
  },
  dark: {
    text: [baseTheme.text, darkTheme.text],
    bg: darkTheme.bg,
    neoSwitch: darkTheme.neoSwitch,
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
