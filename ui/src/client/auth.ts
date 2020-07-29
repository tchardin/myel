import {useCallback} from 'react';
import {
  selector,
  useSetRecoilState,
  useRecoilValue,
  RecoilRootProps,
} from 'recoil';
import {lotusClient, createLotus, LotusConfig} from './LotusProvider';

const STORAGE_KEY = '@Client';

interface AuthParams extends LotusConfig {}

export const signedInState = selector<boolean>({
  key: 'SignedIn',
  get: ({get}) => !!get(lotusClient),
});

export const useAuth = () => {
  const signedIn = useRecoilValue(signedInState);
  const setLotus = useSetRecoilState(lotusClient);
  const signIn = useCallback(
    ({url, token}: AuthParams) => {
      setLotus(createLotus(url, token));
    },
    [setLotus]
  );

  return {
    signedIn,
    signIn,
  };
};

export const initializeState: RecoilRootProps['initializeState'] = ({set}) => {
  const lotusUrl = localStorage.getItem(`${STORAGE_KEY}:lotusUrl`);
  const lotusToken = localStorage.getItem(`${STORAGE_KEY}:lotusToken`);
  if (lotusUrl && lotusToken) {
    set(lotusClient, createLotus(lotusUrl, lotusToken));
  }
};
