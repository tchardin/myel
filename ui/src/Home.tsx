import * as React from 'react';
import {useLayoutEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  useRecoilValue,
  selector,
  atom,
  useSetRecoilState,
  useRecoilState,
} from 'recoil';
import format from 'date-fns/format';
import {
  signedInState,
  lotusClient,
  epochToDate,
  formatPieceSize,
} from './client';
import Text from './components/Text';
import Table from './components/Table';
import Space from './components/Space';
import {PageSheet} from './components/Sheets';

// const getSyncState = (client: LotusClient) => client.syncState();

const userIDQuery = selector<string>({
  key: 'CurrentUserID',
  get: async ({get}) => {
    const client = get(lotusClient);
    const addr = await client.walletDefaultAddress();
    const userID = await client.stateLookupID(addr, []);
    return userID;
  },
});

const walletBalanceQuery = selector<number>({
  key: 'WalletBalance',
  get: async ({get}) => {
    const client = get(lotusClient);
    const addr = await client.walletDefaultAddress();
    const balance = await client.walletBalance(addr);
    return balance;
  },
});

const HomeTitle = () => {
  const userID = useRecoilValue(userIDQuery);
  const balance = useRecoilValue(walletBalanceQuery);
  return (
    <Space scale={3}>
      <Text is="h1">Welcome, {userID}</Text>
      <Space scale={4}>
        <Text is="body">Here are the active deals on the Filecoin market</Text>
      </Space>
      <Space scale={2}>
        <Text is="label">Balance</Text>
        <Text is="balance">
          <Text is="sups">⨎</Text>
          {balance}
        </Text>
      </Space>
    </Space>
  );
};

interface Deal {
  id: string;
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
    const client = get(lotusClient);
    const deals: {[key: string]: any} = await client.stateMarketDeals([]);
    const activeDeals = Object.entries(deals).reduce<Deal[]>(
      (active, [key, deal]) => {
        if (deal.State.SectorStartEpoch !== -1) {
          active.push({
            id: key,
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

const formatDate = (d: Date): string => format(d, 'd MMM, yy');

const DealsTable: React.FC = ({children}) => {
  const data = useRecoilValue(marketDealsQuery);
  const selectDeal = useSetRecoilState(selectedDealState);
  const rows = useMemo(
    () =>
      data.map((deal) => [
        `#${deal.id}`,
        deal.client,
        deal.provider,
        formatDate(deal.start),
        formatDate(deal.end),
        formatPieceSize(deal.size),
      ]),
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

const DealDetails = () => {
  const [selectedDeal, setDeal] = useRecoilState(selectedDealState);
  return (
    <PageSheet visible={!!selectedDeal} onRequestClose={() => setDeal(null)} />
  );
};

const Home = () => {
  const navigate = useNavigate();
  const signedIn = useRecoilValue(signedInState);
  useLayoutEffect(() => {
    if (!signedIn) {
      navigate('/auth');
    }
  }, [navigate, signedIn]);
  return (
    <DealsTable>
      <HomeTitle />
      <DealDetails />
    </DealsTable>
  );
};

export default Home;
