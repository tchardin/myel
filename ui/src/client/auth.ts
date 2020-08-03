import {useCallback} from 'react';
import {
  selector,
  useSetRecoilState,
  useRecoilValue,
  RecoilRootProps,
} from 'recoil';
import {rpcClient, createClient, ClientConfig} from './clients';

const STORAGE_KEY = '@Myel';

export const signedInState = selector<boolean>({
  key: 'SignedIn',
  get: ({get}) => !!get(rpcClient),
});

export const useAuth = () => {
  const signedIn = useRecoilValue(signedInState);
  const setClient = useSetRecoilState(rpcClient);
  const signIn = useCallback(
    (params: ClientConfig) => {
      setClient(createClient(params));
      localStorage.setItem(`${STORAGE_KEY}:config`, JSON.stringify(params));
    },
    [setClient]
  );

  return {
    signedIn,
    signIn,
  };
};

export const initializeState: RecoilRootProps['initializeState'] = ({set}) => {
  const config = localStorage.getItem(`${STORAGE_KEY}:config`);
  if (config) {
    set(rpcClient, createClient(JSON.parse(config)));
  }
};
