import * as React from 'react';
import {useCallback, useMemo, memo} from 'react';
import {Pressable, View, FlatList, StyleSheet, ViewProps} from 'react-native';
import {useTheme} from '../theme';
import {useHover} from '../hooks/useHover';
import Text from './Text';

type RowProps = {
  head?: boolean;
  onPress?: (e: any) => void;
};

const Row: React.FC<RowProps> = memo(({children, head, onPress}) => {
  const {theme} = useTheme();
  const [hovered, handlers] = useHover({disabled: head});
  return (
    <Pressable
      onPress={onPress}
      {...handlers}
      style={[
        styles.row,
        !!onPress && styles.pressableRow,
        !head && theme.neoTableRow,
        hovered && theme.neoTableRowHovered,
      ]}>
      {children}
    </Pressable>
  );
});

const CellRenderer: React.FC<ViewProps> = memo((props) => (
  <View {...props} style={styles.cellRenderer} />
));

const Cell: React.FC = memo(({children}) => {
  return <View style={[styles.cell]}>{children}</View>;
});

type TableProps = {
  children: any;
  data: any[][];
  head: string[];
  onSelect: (item: any) => void;
};

const Table: React.FC<TableProps> = memo(({children, data, head, onSelect}) => {
  const {theme} = useTheme();
  const renderItem = useCallback(
    ({item, head}) => (
      <Row onPress={head ? undefined : () => onSelect(item)} head={head}>
        {item.map(
          (dat: string, i: number): React.ReactNode => (
            <Cell key={`cell-${i}-${item[0]}`}>
              <Text is={head ? 'label' : 'body'}>{dat}</Text>
            </Cell>
          )
        )}
      </Row>
    ),
    [onSelect]
  );
  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        {children}
        {renderItem({item: head, head: true})}
      </View>
    ),
    [children, head, renderItem]
  );
  const keyExtractor = useCallback((item) => item[0], []);
  const contStyle = useMemo(() => [styles.container, theme.bg], [theme.bg]);
  const getItemLayout = useCallback(
    (data, index) => ({length: 56, offset: 56 * index, index}),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      CellRendererComponent={CellRenderer}
      ListHeaderComponent={renderHeader}
      ListHeaderComponentStyle={styles.header}
      keyExtractor={keyExtractor}
      contentContainerStyle={contStyle}
      getItemLayout={getItemLayout}
      initialNumToRender={25}
      maxToRenderPerBatch={25}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
    height: 52,
  },
  pressableRow: {
    // @ts-ignore: web style
    cursor: 'pointer',
  },
  cellRenderer: {
    width: '100%',
    maxWidth: 800,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    width: '100%',
    maxWidth: 800,
  },
});

export default Table;
