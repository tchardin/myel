import * as React from 'react';
import {View, ViewProps, StyleSheet} from 'react-native';
// @ts-ignore: no types available
import {unstable_createElement} from 'react-native-web';
import {useTheme} from '../theme';

interface SwitchProps extends ViewProps {
  disabled?: boolean;
  value?: boolean;
  label?: string;
  onValueChange?: (val?: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
  disabled,
  value,
  label,
  onValueChange,
  ...other
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked;
    onValueChange && onValueChange(checked);
  };
  const control = unstable_createElement('input', {
    type: 'checkbox',
    checked: value,
    disabled: disabled,
    onChange: handleChange,
    accessibilityLabel: label,
    style: [styles.nativeInput, styles.cursorInherit],
  });
  const {theme} = useTheme();
  return (
    <View
      style={[
        styles.track,
        theme.neoSwitch,
        disabled ? styles.cursorDefault : styles.cursorPointer,
      ]}>
      <View style={[styles.thumb, value && styles.thumbOn]} />
      {control}
    </View>
  );
};

const SWITCH_HEIGHT = 20;
const HANDLE_INSET = 2;
const SWITCH_WIDTH = 36;

const styles = StyleSheet.create({
  cursorPointer: {
    // @ts-ignore: web style
    cursor: 'pointer',
    userSelect: 'none',
  },
  cursorDefault: {
    // @ts-ignore: web style
    cursor: 'default',
  },
  cursorInherit: {
    // @ts-ignore: web style
    cursor: 'inherit',
  },
  track: {
    height: SWITCH_HEIGHT,
    marginTop: -HANDLE_INSET,
    width: SWITCH_WIDTH,
    borderRadius: 999,
    padding: HANDLE_INSET,
    // @ts-ignore: web style
    transitionDuration: `250ms`,
  },
  thumb: {
    backgroundColor: '#FFF',
    height: SWITCH_HEIGHT - HANDLE_INSET * 2,
    width: SWITCH_HEIGHT - HANDLE_INSET * 2,
    // @ts-ignore: web style
    boxShadow: '3px 3px 9px rgba(0, 0, 0, 0.06)',
    borderRadius: 999,
    transitionDuration: `250ms`,
    transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
    left: 0,
  },
  thumbOn: {
    left: SWITCH_WIDTH - SWITCH_HEIGHT,
  },
  nativeInput: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    margin: 0,
    opacity: 0,
    padding: 0,
    width: '100%',
  },
});

export default Switch;
