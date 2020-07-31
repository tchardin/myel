import * as React from 'react';
import {useRef, useMemo} from 'react';
import {View, StyleSheet, Animated, PanResponder} from 'react-native';

import {useTheme} from '../theme';
import {useBreakpoint} from '../hooks/useBreakpoint';
import Toolbar from '../components/Toolbar';

const STORAGE_KEY = '@UI:PaneSize';

type AppLayoutProps = {
  master: React.ReactNode;
  detail: React.ReactNode;
};

const initWidth = (width: number): number => {
  const cached = window.localStorage.getItem(STORAGE_KEY);
  return cached ? parseInt(cached) : width * 0.4;
};

const AppLayout: React.FC<AppLayoutProps> = ({master, detail}) => {
  const {theme} = useTheme();
  const {index, width} = useBreakpoint();
  const w = useRef(new Animated.Value(initWidth(width))).current;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        // @ts-ignore: accessing private property
        onPanResponderGrant: () => w.setOffset(w._value),
        onPanResponderMove: Animated.event([null, {dx: w}], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (e, {vx}) => {
          w.flattenOffset();
          // @ts-ignore
          window.localStorage.setItem(STORAGE_KEY, `${w._value}`);
        },
      }),
    [w]
  );
  return (
    <View
      style={[
        styles.container,
        theme.bg,
        index > 3
          ? styles.marginLg
          : index > 1
          ? styles.marginMd
          : styles.marginSm,
      ]}>
      <Animated.View style={[styles.master, {width: w}]}>
        {master}
      </Animated.View>
      <View style={styles.handle} {...pan.panHandlers}>
        <View style={[styles.bar, theme.handle]} />
      </View>
      <View style={[styles.detail, theme.neoCard]}>{detail}</View>
      <Toolbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  marginLg: {
    padding: 40,
  },
  marginMd: {
    padding: 24,
  },
  marginSm: {
    padding: 16,
  },
  master: {
    height: '100%',
  },
  detail: {
    height: '100%',
    flex: 1,
    borderRadius: 48,
    overflow: 'hidden',
  },
  handle: {
    height: '100%',
    width: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
    // @ts-ignore: web only
    cursor: 'col-resize',
  },
  bar: {
    height: 80,
    width: 4,
    borderRadius: 4,
  },
});

export default AppLayout;
