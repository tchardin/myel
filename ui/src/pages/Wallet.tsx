import * as React from 'react';
import {Suspense} from 'react';
import {selector, useRecoilValue} from 'recoil';
import {rpcClient} from '../client';
import {FilecoinNumber} from '../utils/FilecoinNumber';
import Text from '../components/Text';
import Space from '../components/Space';
import {VStack} from '../components/Stack';

const userIDQuery = selector<string>({
  key: 'CurrentUserID',
  get: async ({get}) => {
    const client = get(rpcClient);
    const addr = await client.walletDefaultAddress();
    const userID = await client.stateLookupID(addr, []);
    return userID;
  },
});
const Title = () => {
  const userID = useRecoilValue(userIDQuery);
  return (
    <VStack mt={7}>
      <Text is="h2">Welcome, {userID}</Text>
    </VStack>
  );
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
  Online: 'Your node is online and running properly',
  PendingSync: 'Your node is still catching up with the latest blocks',
  Offline: 'Your node is down or there is a network issue',
};
type NodeStatus = 'Online' | 'PendingSync' | 'Offline';
type NodeInfo = {
  version: string;
  apiVersion: string;
  blockDelay: string;
  status: NodeStatus;
};
const statusQuery = selector({
  key: 'NodeStatus',
  get: async ({get}) => {
    const client = get(rpcClient);
    const info = await client.version();
    return {
      version: info.Version,
      apiVersion: info.APIVersion,
      blockDelay: info.BlockDelay,
      status: info.BlockDelay > 0 ? 'PendingSync' : 'Online',
    };
  },
});
const NodeStatus = () => {
  const info = useRecoilValue(statusQuery);
  return (
    <Space scale={4}>
      <Text is="body">{statusInfo[info.status as NodeStatus]}</Text>
    </Space>
  );
};

const Wallet = () => {
  return (
    <Space scale={3}>
      <Suspense fallback={null}>
        <Title />
      </Suspense>
      <Suspense fallback={null}>
        <NodeStatus />
      </Suspense>
      <Suspense fallback={null}>
        <Balance />
      </Suspense>
    </Space>
  );
};

export default Wallet;
