import * as React from 'react';
import {Suspense, useCallback, useEffect} from 'react';
import {
  selector,
  useRecoilValue,
  useSetRecoilState,
  useRecoilState,
  atom,
} from 'recoil';
import {rpcClient} from '../client';
import {FilecoinNumber} from '../utils/FilecoinNumber';
import Text from '../components/Text';
import Space from '../components/Space';
import {VStack} from '../components/Stack';
import Button from '../components/Button';
import PageTitle from '../components/PageTitle';
import {suggestedCidsState} from '../recoil/shared';
import {Cid} from '../sharedTypes';
import ErrorBoundary from '../utils/ErrorBoundary';

const userIDQuery = selector<string>({
  key: 'CurrentUserID',
  get: async ({get}) => {
    const client = get(rpcClient);
    const addr = await client.walletDefaultAddress();
    const userID = await client.stateLookupID(addr, []);
    return userID;
  },
});
const UserTitle = () => {
  const userID = useRecoilValue(userIDQuery);
  return <PageTitle title={`Welcome, ${userID}`} secondary />;
};

const walletBalanceQuery = selector<string>({
  key: 'WalletBalance',
  get: async ({get}) => {
    const client = get(rpcClient);
    const addr = await client.walletDefaultAddress();
    const balance = await client.walletBalance(addr);
    return new FilecoinNumber(balance, 'attofil').toFixed(4);
  },
});
const Balance = () => {
  const balance = useRecoilValue(walletBalanceQuery);
  return (
    <Space scale={2}>
      <Text is="label">Balance</Text>
      <Text is="balance">
        <Text is="sups">⨎</Text>
        {balance}
      </Text>
    </Space>
  );
};

const statusInfo = {
  Online: 'Your lotus node is online and running',
  PendingSync: 'Your lotus node is still catching up with the latest blocks',
  Offline: 'Your lotus node is down or there is a network issue',
};
type NodeStatus = 'Online' | 'PendingSync' | 'Offline';
type NodeInfo = {
  version: string;
  apiVersion: string;
  blockDelay: string;
};
const nodeInfoQuery = selector<NodeInfo>({
  key: 'NodeInfo',
  get: async ({get}) => {
    const client = get(rpcClient);
    const info = await client.version();
    return {
      version: info.Version,
      apiVersion: info.APIVersion,
      blockDelay: info.BlockDelay,
    };
  },
});
enum SyncStateStage {
  StageIdle,
  StageHeaders,
  StagePersistHeaders,
  StageMessages,
  StageSyncComplete,
  StageSyncErrored,
}
type ActiveSync = {
  Stage: SyncStateStage;
};
type SyncState = {
  ActiveSyncs: ActiveSync[];
};
const syncStateQuery = selector<SyncState>({
  key: 'SyncState',
  get: async ({get}) => {
    const client = get(rpcClient);
    const state = await client.syncState();
    return state;
  },
});
const syncStatusState = atom<NodeStatus>({
  key: 'NodeStatus',
  default: 'Offline',
});
const useNodeSyncStatus = () => {
  const syncState = useRecoilValue(syncStateQuery);
  const client = useRecoilValue(rpcClient);
  const [status, setStatus] = useRecoilState(syncStatusState);
  useEffect(() => {
    if (
      syncState.ActiveSyncs.some(
        (as) => as.Stage !== SyncStateStage.StageSyncComplete
      )
    ) {
      setStatus('PendingSync');
      client.syncIncomingBlocks(console.log);
    } else {
      setStatus('Online');
    }
  }, [client, setStatus, syncState]);

  return status;
};

const NodeStatus = () => {
  const info = useRecoilValue(nodeInfoQuery);
  const status = useNodeSyncStatus();
  return (
    <Space scale={4}>
      <Text is="body">{statusInfo[status as NodeStatus]}</Text>
      <Text is="body">Version: {info.version}</Text>
    </Space>
  );
};

const connectedFaucetQuery = selector({
  key: 'ConnectedFaucets',
  get: async ({get}) => {
    const client = get(rpcClient);
    const peers = await client.connectedFaucets();
    return peers;
  },
});

const ConnectedFaucets = () => {
  const client = useRecoilValue(rpcClient);
  const setNewCids = useSetRecoilState(suggestedCidsState);
  const faucets = useRecoilValue(connectedFaucetQuery);
  const start = useCallback(() => {
    client.queryFaucet((cid: Cid) => setNewCids((cids) => [...cids, cid]));
  }, [client, setNewCids]);

  console.log(faucets);

  return (
    <>
      {faucets.map((f: any, i: number) => (
        <VStack p={4}>
          <Space scale={4}>
            <Text is="body">New faucet detected</Text>
          </Space>
          <Button onPress={start}>Start</Button>
        </VStack>
      ))}
    </>
  );
};
const FaucetError = () => {
  return (
    <VStack>
      <Text is="body">Could not connect to Myel retrieval node</Text>
    </VStack>
  );
};

const Wallet = () => {
  return (
    <Space scale={3}>
      <ErrorBoundary fallback={<PageTitle title="Welcome" secondary />}>
        <Suspense
          fallback={
            <PageTitle title="TODO" subtitle="TODO" secondary loading />
          }>
          <UserTitle />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <NodeStatus />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Balance />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={<FaucetError />}>
        <Suspense fallback={null}>
          <ConnectedFaucets />
        </Suspense>
      </ErrorBoundary>
    </Space>
  );
};

export default Wallet;
