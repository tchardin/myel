import {
  // @ts-ignore: no types available
  unstable_createElement,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {useTheme, Colors} from '../theme/ThemeProvider';

type SvgElementProps = {
  fill?: string;
  stroke?: string;
  d?: string;
  type?: string;
  colorable?: boolean;
  fillRule?: string;
  clipRule?: string;
  fillOpacity?: string;
};

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

type IconConfig = {
  content: SvgElementProps[];
  height: number;
  width: number;
  viewBox: string;
  fill?: string;
};

const colorElement = (
  props: SvgElementProps,
  colors: Colors,
  color?: string
) => {
  const colored: SvgElementProps = {};
  if (props.colorable && color && 'fill' in props) {
    colored.fill = colors[color] || color;
  }
  if (props.colorable && color && 'stroke' in props) {
    colored.stroke = colors[color] || color;
  }
  return colored;
};

const createIconComponent = ({
  content,
  height,
  width,
  viewBox,
}: IconConfig): React.FC<IconProps> => (initialProps) => {
  const {colors} = useTheme();
  const props = {
    ...initialProps,
    style: StyleSheet.compose(styles.root, initialProps.style),
    width,
    height,
    viewBox,
  };

  return unstable_createElement(
    'svg',
    props,
    ...content.map(({type, ...rest}) =>
      unstable_createElement(type, {
        ...rest,
        ...colorElement(rest, colors, initialProps.color),
      })
    )
  );
};

const styles = StyleSheet.create({
  root: {
    // @ts-ignore: web styles
    display: 'inline-block',
    fill: 'currentcolor',
    // height: '1.25em',
    maxWidth: '100%',
    position: 'relative',
    userSelect: 'none',
    // @ts-ignore: web styles
    textAlignVertical: 'text-bottom',
    pointerEvents: 'none',
  },
});

export default createIconComponent;
