import * as React from 'react';
import {TextInput, StyleSheet, View} from 'react-native';
import {useTheme} from '../theme';
import {FieldRenderProps} from 'react-final-form';
import FieldWrapper from './FieldWrapper';

interface TextFieldProps extends FieldRenderProps<string, any> {
  label?: string;
  fullWidth?: boolean;
  placeholder?: string;
  accessory?: React.ReactNode;
}

const TextField: React.FC<TextFieldProps> = ({
  input,
  meta,
  label,
  accessory,
  fullWidth,
  placeholder,
}) => {
  const {theme} = useTheme();
  return (
    <FieldWrapper labelID={input.name} label={label} fullWidth={fullWidth}>
      <TextInput
        onChange={input.onChange}
        value={input.value || ''}
        // types aren't exactly compatible so we don't pass event objs
        onFocus={() => input.onFocus()}
        onBlur={() => input.onBlur()}
        aria-labelledby={input.name}
        testID={input.name}
        placeholder={placeholder}
        style={[
          theme.text,
          styles.base,
          theme.neoField,
          meta.active && theme.neoFieldFocused,
          meta.touched && meta.error && theme.neoFieldError,
          fullWidth && styles.fullWidth,
          !!accessory && styles.accessorySpace,
        ]}
      />
      {!!accessory && <View style={styles.accessory}>{accessory}</View>}
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  accessorySpace: {
    paddingRight: 24,
  },
  accessory: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TextField;
