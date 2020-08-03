import * as React from 'react';
import {View} from 'react-native';
import Text from './Text';

const ErrorFallback = () => {
  return (
    <View>
      <Text is="h3">Sorry something went wrong</Text>
    </View>
  );
};

export default ErrorFallback;
