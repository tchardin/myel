import {atom} from 'recoil';
/* import LotusRPC from './LotusRPC'; */
import MyelRPC from './MyelRPC';
import BrowserProvider from './BrowserProvider';
// @ts-ignore: no types for module
import {testnet} from '@filecoin-shipyard/lotus-client-schema';

// TODO: maybe we can do typing for this
export type MyelClient = any;

export interface ClientConfig {
  fullNodeUrl: string;
  storageNodeUrl: string;
  myelUrl: string;
  token: string;
}

export const epochToDate = (
  epoch: number,
  genesisTime: number = 1592524800
): Date => {
  // https://github.com/filecoin-project/specs-actors/blob/66daab5d2897a41cbf17c2c8fc63247cbd0533df/actors/builtin/network.go#L16
  const epochDurationSeconds = 25;
  return new Date(genesisTime * 1000 + epoch * epochDurationSeconds * 1000);
};

export const formatPieceSize = (
  bytes: number,
  decimals: number = 2
): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const createClient = (config: ClientConfig): any =>
  new MyelRPC({
    myel: {
      provider: new BrowserProvider(config.myelUrl, {
        token: config.token,
      }),
      schema: {
        methods: {
          AddGet: {},
          NewCidNotify: {
            subscription: true,
          },
        },
      },
      tag: 'MyelRetrieval',
    },
    lotusFullNode: {
      provider: new BrowserProvider(config.fullNodeUrl, {
        token: config.token,
      }),
      schema: testnet.fullNode,
      tag: 'Filecoin',
    },
    lotusStorageMiner: {
      provider: new BrowserProvider(config.storageNodeUrl, {
        token: config.token,
      }),
      schema: testnet.storageMiner,
      tag: 'Filecoin',
    },
  });

export const rpcClient = atom<MyelClient>({
  key: 'RPCClient',
  default: null,
  dangerouslyAllowMutability: true,
});
