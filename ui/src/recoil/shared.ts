import {atom} from 'recoil';
import {Cid} from '../sharedTypes';

export const suggestedCidsState = atom<Cid[]>({
  key: 'SuggestedCIDs',
  default: [],
});

export const connectedFaucetState = atom<any[]>({
  key: 'ConnectedFaucets',
  default: [],
});
