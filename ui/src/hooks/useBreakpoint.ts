import {useMemo} from 'react';
import {useWindowDimensions} from 'react-native';

type BreakpointNames = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl';
type Breakpoint = {
  width: number;
  index: number;
  name: BreakpointNames;
};

export const breakpoints = [359, 599, 719, 839, 1023];
export const nomenclature: BreakpointNames[] = [
  'xxs',
  'xs',
  's',
  'm',
  'l',
  'xl',
];

export const useBreakpoint = (): Breakpoint => {
  const {width} = useWindowDimensions();
  const bp = useMemo(
    () =>
      breakpoints.reduce((res, cur, i) => {
        if (width > cur) {
          return res + 1;
        }
        return res;
      }, 0),
    [width]
  );
  return {
    width,
    index: bp,
    name: nomenclature[bp],
  };
};
