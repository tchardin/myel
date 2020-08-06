import * as React from 'react';
import {useMemo, Suspense} from 'react';
import {
  useRecoilValue,
  selector,
  selectorFamily,
  atom,
  waitForAll,
  useSetRecoilState,
  useRecoilState,
} from 'recoil';
import format from 'date-fns/format';
import {rpcClient, epochToDate, formatPieceSize} from '../client';
import PageTitle from '../components/PageTitle';
import Text from '../components/Text';
import Table from '../components/Table';
import Space from '../components/Space';
import {PageSheet} from '../components/Sheets';
import {VStack} from '../components/Stack';
import {Cid} from '../sharedTypes';
import PageFallback from '../components/PageFallback';
import ErrorBoundary from '../utils/ErrorBoundary';

interface Deal {
  id: string;
  cid: Cid;
  client: string;
  provider: string;
  start: Date;
  end: Date;
  size: number;
  pricePerEpoch: string;
  providerCollateral: string;
  clientCollateral: string;
}

const selectedDealState = atom<Deal | null>({
  key: 'SelectedDealState',
  default: null,
});

const marketDealsQuery = selector({
  key: 'MarketDeals',
  get: async ({get}) => {
    const client = get(rpcClient);
    const deals: {[key: string]: any} = await client.stateMarketDeals([]);
    const activeDeals = Object.entries(deals).reduce<Deal[]>(
      (active, [key, deal]) => {
        if (deal.State.SectorStartEpoch !== -1) {
          active.push({
            id: key,
            cid: deal.Proposal.PieceCID,
            client: deal.Proposal.Client,
            provider: deal.Proposal.Provider,
            start: epochToDate(deal.Proposal.StartEpoch),
            end: epochToDate(deal.Proposal.EndEpoch),
            size: deal.Proposal.PieceSize,
            pricePerEpoch: deal.Proposal.StoragePricePerEpoch,
            providerCollateral: deal.Proposal.ProviderCollateral,
            clientCollateral: deal.Proposal.ClientCollateral,
          });
        }
        return active;
      },
      []
    );
    return activeDeals;
  },
});

type MinerInfo = {
  Multiaddrs: any;
  NewWorker: string;
  Owner: string;
  PeerId: string;
  SealProofType: number;
  SectorSize: number;
  WindowPoStPartitionSectors: number;
  Worker: string;
  WorkerChangeEpoch: number;
};

const minerInfoQuery = selectorFamily({
  key: 'MinerInfo',
  get: (miner: string) => async ({get}) => {
    const client = get(rpcClient);
    const minerInfo = await client.stateMinerInfo(miner, []);
    return minerInfo;
  },
});

const peerConnectedQuery = selectorFamily({
  key: 'PeerConnected',
  get: (miner: string) => async ({get}) => {
    const client = get(rpcClient);
    const minerInfo = get(minerInfoQuery(miner));
    const connected = await client.netConnectedness(minerInfo.PeerId);
    return connected;
  },
});

const dealsMinersConnectedQuery = selector({
  key: 'DealsMinersConnected',
  get: ({get}) => {
    const marketDeals = get(marketDealsQuery);
    const connected = get(
      waitForAll(marketDeals.map((deal) => peerConnectedQuery(deal.provider)))
    );
    // @ts-ignore
    // "This condition will always return 'false' since the types 'Loadable<any>' and 'number' have no overlap."
    // Looks like an issue with recoil types expecting connected to be an array of Loadbles
    return marketDeals.filter((deal, i) => connected[i] === 1);
  },
});

const formatDate = (d: Date): string => format(d, 'd MMM, yy');

const DealsTable: React.FC = ({children}) => {
  const data = useRecoilValue(dealsMinersConnectedQuery);
  const selectDeal = useSetRecoilState(selectedDealState);
  const rows = useMemo(
    () =>
      data.map((deal) => ({
        ...deal,
        data: [
          `#${deal.id}`,
          deal.client,
          deal.provider,
          formatDate(deal.start),
          formatDate(deal.end),
          formatPieceSize(deal.size),
        ],
      })),
    [data]
  );
  const head = useMemo(
    () => ['ID', 'CLIENT', 'PROVIDER', 'START', 'END', 'SIZE'],
    []
  );
  return (
    <Table data={rows} children={children} head={head} onSelect={selectDeal} />
  );
};
const retrievalOffersQuery = selectorFamily({
  key: 'RetrievalOffers',
  get: ({cid, miner}: RetrievalOffersProps) => async ({get}) => {
    const client = get(rpcClient);
    const dealInfo = await client.clientMinerQueryOffer(cid, miner);
    return dealInfo;
  },
});

type RetrievalOffersProps = {
  cid: Cid;
  miner: string;
};

const RetrievalOffers = ({cid, miner}: RetrievalOffersProps) => {
  const offer = useRecoilValue(retrievalOffersQuery({cid, miner}));
  console.log(offer);
  return null;
};

const DealDetails = () => {
  const [selectedDeal, setDeal] = useRecoilState(selectedDealState);
  return (
    <PageSheet visible={!!selectedDeal} onRequestClose={() => setDeal(null)}>
      {selectedDeal && (
        <VStack p={7} flex={1}>
          <Space scale={5}>
            <Text is="h2">Deal #{selectedDeal.id}</Text>
          </Space>
          <Space scale={2}>
            <Text is="body">Client: {selectedDeal.client}</Text>
            <Text is="body">Provider: {selectedDeal.provider}</Text>
            <Text is="body">Start: {formatDate(selectedDeal.start)}</Text>
            <Text is="body">End: {formatDate(selectedDeal.end)}</Text>
            <Text is="body">
              File size: {formatPieceSize(selectedDeal.size)}
            </Text>
          </Space>
          <Suspense fallback={null}>
            <RetrievalOffers
              cid={selectedDeal.cid}
              miner={selectedDeal.provider}
            />
          </Suspense>
        </VStack>
      )}
    </PageSheet>
  );
};

const Deals = () => {
  return (
    <ErrorBoundary fallback={<PageFallback />}>
      <Suspense fallback={<PageFallback loading />}>
        <DealsTable>
          <PageTitle
            title="Market deals"
            subtitle="List of storage deals between peers you are connected with"
          />
          <DealDetails />
        </DealsTable>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Deals;
