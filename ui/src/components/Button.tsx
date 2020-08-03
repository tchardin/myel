import * as React from 'react';
import {useState, useCallback} from 'react';
import {TouchableWithoutFeedback, View, StyleSheet, Text} from 'react-native';

import {useTheme} from '../theme';
import {useHover} from '../hooks/useHover';

type ButtonProps = {
  onPress?: (e: any) => void;
  is?: 'Primary' | 'Secondary' | 'Success' | 'Destroy';
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({children, is, disabled, onPress}) => {
  const {theme} = useTheme();
  const [pressed, setPressed] = useState(false);
  const pressIn = useCallback(() => setPressed(true), []);
  const pressOut = useCallback(() => setPressed(false), []);
  const [hovered, handlers] = useHover({disabled});
  return (
    <TouchableWithoutFeedback
      accessibilityRole="button"
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      disabled={disabled}>
      <View
        {...handlers}
        style={[
          styles.container,
          theme.neoButton,
          theme[`neoButton${is}`],
          hovered && theme.neoButtonHovered,
          pressed && theme.neoButtonPressed,
          disabled && styles.disabled,
        ]}>
        <Text style={[theme.text, styles.label]} selectable={false}>
          {children}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

Button.defaultProps = {
  is: 'Primary',
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  label: {
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default Button;
