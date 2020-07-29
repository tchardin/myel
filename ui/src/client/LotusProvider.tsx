import {atom} from 'recoil';
import LotusRPC from './LotusRPC';
import BrowserProvider from './BrowserProvider';
// @ts-ignore: no types for module
import {testnet} from '@filecoin-shipyard/lotus-client-schema';

// TODO: maybe we can do typing for this
export type LotusClient = any;

export interface LotusConfig {
  url: string;
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

export const createLotus = (url: string, token: string): any =>
  new LotusRPC(
    new BrowserProvider(url, {
      token,
    }),
    {schema: testnet.fullNode}
  );

export const lotusClient = atom<LotusClient>({
  key: 'lotusClient',
  default: null,
  dangerouslyAllowMutability: true,
});
