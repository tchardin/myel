import * as React from 'react';
import {useMemo, Suspense, useCallback} from 'react';
import {selector, useRecoilValue} from 'recoil';
import Text from '../components/Text';
import Table from '../components/Table';
import Space from '../components/Space';
import {rpcClient} from '../client';
import {VStack} from '../components/Stack';

type Addresses = string[];
type PeerInfo = {
  Addrs: Addresses;
  ID: string;
  Country?: string;
  City?: string;
};

const locationEndpoint = 'http://ip-api.com/batch';

const peersQuery = selector<PeerInfo[]>({
  key: 'NetPeers',
  get: async ({get}) => {
    const client = get(rpcClient);
    const peers = await client.netPeers();
    const peerLocations = await fetch(locationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        peers.slice(0, 100).map((p: PeerInfo) => ({
          query: p.Addrs[0].split('/')[2],
          fields: 'country,city',
        }))
      ),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
    return peers.map((p: PeerInfo, i: number) => ({
      Addrs: p.Addrs,
      ID: p.ID,
      Country: peerLocations?.[i]?.country ?? 'Unavailable',
      City: peerLocations?.[i]?.city ?? 'Unavailable',
    }));
  },
});

const shortID = (p: string): string => {
  return p.slice(-8);
};

const PeersTable: React.FC = ({children}) => {
  const data = useRecoilValue(peersQuery);
  console.log(data);
  const rows = useMemo(
    () =>
      data.map((peer) => ({
        ...peer,
        data: [shortID(peer.ID), peer.Country, peer.City],
      })),
    [data]
  );
  const head = useMemo(() => ['ID', 'COUNTRY', 'CITY'], []);
  const select = useCallback(() => {}, []);
  return (
    <Table data={rows} children={children} head={head} onSelect={select} />
  );
};

const Peers = () => {
  return (
    <PeersTable>
      <VStack mt={7} mb={3}>
        <Space scale={2}>
          <Text is="h1">Network peers</Text>
          <Text is="body">List of peers your node may be connected to</Text>
        </Space>
      </VStack>
    </PeersTable>
  );
};

export default Peers;
