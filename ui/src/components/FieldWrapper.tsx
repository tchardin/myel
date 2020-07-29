import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import Text from './Text';

type FieldWrapperProps = {
  label?: string;
  fullWidth?: boolean;
  labelID?: string;
};

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  fullWidth,
  children,
  labelID,
}) => {
  return (
    <View style={[fullWidth && styles.fullWidth]}>
      {!!label && (
        <Text is="label" style={styles.label} nativeID={labelID}>
          {label}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: 12,
  },
});

export default FieldWrapper;
