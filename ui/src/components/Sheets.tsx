import * as React from 'react';
import {View, ModalProps, ViewProps, StyleSheet} from 'react-native';
import FocusLock from 'react-focus-lock';
import {RemoveScroll} from 'react-remove-scroll';
import Portal from './Portal';
import {useTheme} from '../theme';

interface OverlayProps extends ViewProps {
  visible?: boolean;
  onRequestClose?: () => void;
}

const noop = () => {};
const Overlay: React.FC<OverlayProps> = ({
  visible,
  style,
  onRequestClose = noop,
  ...props
}) => {
  return visible ? (
    <Portal>
      <FocusLock autoFocus returnFocus>
        <RemoveScroll>
          <View
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => {
              onRequestClose();
            }}
            // @ts-ignore: web only prop
            onKeyPress={(e) => {
              if (e.key === 'Escape') {
                onRequestClose();
              }
            }}
            {...props}
            style={[styles.overlay, style]}
          />
        </RemoveScroll>
      </FocusLock>
    </Portal>
  ) : null;
};
const Sheet: React.FC<ViewProps> = (props) => (
  <View onStartShouldSetResponder={() => true} accessible={true} {...props} />
);

export const PageSheet: React.FC<ModalProps> = ({
  visible,
  onRequestClose,
  children,
  ...props
}) => {
  const {theme} = useTheme();
  return (
    <Overlay
      visible={visible}
      onRequestClose={onRequestClose}
      style={theme.bgOverlay}>
      <Sheet children={children} style={[styles.pageSheet, theme.bg]} />
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageSheet: {
    height: 800,
    maxWidth: 520,
    width: '100%',
    borderRadius: 24,
    backdropFilter: 'blur(8px)',
  },
});
