import * as React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {useNavigate, useLocation} from 'react-router-dom';
import {useTheme} from '../theme';
import Adjust from '../icons/Adjust';
import List from '../icons/List';
import Retrieving from '../icons/Retrieving';
import Peers from '../icons/Peers';

import {useHover} from '../hooks/useHover';

type ItemProps = {
  path: string;
};

const Item: React.FC<ItemProps> = ({children, path}) => {
  const {theme} = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, handlers] = useHover();
  const isActive = location.pathname === path;
  return (
    <Pressable
      style={[
        styles.item,
        theme.bg,
        hovered && theme.neoTableRowHovered,
        isActive && theme.highlight,
      ]}
      onPress={() => navigate(path)}
      {...handlers}>
      {children}
    </Pressable>
  );
};

const Toolbar = () => {
  const {theme} = useTheme();
  return (
    <View
      style={[styles.base, theme.neoCard, theme.bg]}
      // @ts-ignore: web role
      accessibilityRole="navigation">
      <Item path="/">
        <List color="text" />
      </Item>
      <Item path="/pieces">
        <Retrieving color="text" />
      </Item>
      <Item path="/peers">
        <Peers color="text" />
      </Item>
      <Item path="/adjust">
        <Adjust color="text" />
      </Item>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 64,
    width: 375,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'absolute',
    left: 120,
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

export default Toolbar;
