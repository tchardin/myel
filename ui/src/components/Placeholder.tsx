import * as React from 'react';
import {createContext, useRef, useEffect, useMemo} from 'react';
import {ViewProps, Animated} from 'react-native';
import {useTheme} from '../theme';

const {Consumer, Provider} = createContext({});

const AnimationConsumer: React.FC<ViewProps> = ({style, ...props}) => (
  <Consumer>
    {(animStyle) => <Animated.View style={[animStyle, style]} {...props} />}
  </Consumer>
);

const FADE_START = 0.5;
const FADE_END = 1;
const Fade: React.FC<ViewProps> = ({children}) => {
  const opacity = useRef(new Animated.Value(FADE_START)).current;
  const anim = useRef(
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 500,
          isInteraction: false,
          toValue: FADE_END,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          duration: 500,
          isInteraction: false,
          toValue: FADE_START,
          useNativeDriver: false,
        }),
      ])
    )
  ).current;
  useEffect(() => {
    anim.start();
  }, [anim]);
  const value = useMemo(() => ({opacity, height: '100%'}), [opacity]);
  return <Provider value={value}>{children}</Provider>;
};

interface LinePlaceholderProps extends ViewProps {
  height?: number;
  color?: string;
  width?: number | string;
  borderRadius?: number;
}
const Line: React.FC<LinePlaceholderProps> = ({
  color,
  borderRadius,
  width,
  height,
}) => {
  const {colors} = useTheme();
  const compStyle = useMemo(
    () => ({
      backgroundColor: color || colors.plh,
      borderRadius,
      width,
      height,
    }),
    [color, colors.plh, borderRadius, width, height]
  );
  return <AnimationConsumer style={compStyle} />;
};
Line.defaultProps = {
  height: 24,
  width: '100%',
  borderRadius: 4,
};

type PlaceholderProps = {
  Animation?: React.ComponentType;
};
interface PlaceholderC extends React.FC<PlaceholderProps> {
  Fade: React.FC<ViewProps>;
  Line: React.FC<LinePlaceholderProps>;
}
const Placeholder: PlaceholderC = ({children, Animation}) => {
  if (Animation) {
    return <Animation>{children}</Animation>;
  }
  return <>{children}</>;
};

Placeholder.Fade = Fade;
Placeholder.Line = Line;

export default Placeholder;
