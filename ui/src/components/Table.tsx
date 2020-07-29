import * as React from 'react';
import {useCallback, useMemo, memo} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import Text from './Text';

type RowProps = {
  head?: boolean;
};

const Row: React.FC<RowProps> = memo(({children, head}) => {
  const {theme} = useTheme();
  return (
    <View style={[styles.row, !head && theme.neoTableCell]}>{children}</View>
  );
});

const Cell: React.FC = memo(({children}) => {
  return <View style={[styles.cell]}>{children}</View>;
});

type TableProps = {
  children: any;
  data: any[][];
  head: string[];
};

const Table: React.FC<TableProps> = memo(({children, data, head}) => {
  const {theme} = useTheme();
  const renderItem = useCallback(
    ({item, head}) =>
      item.map(
        (dat: string, i: number): React.ReactNode => (
          <Cell key={`cell-${i}-${item[0]}`}>
            <Text is={head ? 'label' : 'body'}>{dat}</Text>
          </Cell>
        )
      ),
    []
  );
  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        {children}
        <Row head>{renderItem({item: head, head: true})}</Row>
      </View>
    ),
    [children, head, renderItem]
  );
  const keyExtractor = useCallback((item) => item[0], []);
  const contStyle = useMemo(() => [styles.container, theme.bg], [theme.bg]);
  const getItemLayout = useCallback(
    (data, index) => ({length: 56, offset: 56 * index, index}),
    [0]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      CellRendererComponent={Row}
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
    flexDirection: 'row',
    width: '100%',
    maxWidth: 800,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
    height: 52,
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
