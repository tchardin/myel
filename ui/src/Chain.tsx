import * as React from 'react';
import {useReducer} from 'react';
import {useEffect} from 'react';

import Card from './components/Card';
import Text from './components/Text';
import Space from './components/Space';

type Cid = {
  '/': string;
};
type MinerID = string;

type BlockHeader = {
  miner: MinerID;
  timestamp: number;
};

type TipSet = {
  blocks: BlockHeader[];
  height: number;
};

type ChangeVal = {
  Blocks: any[];
  Cids: any[];
  Height: number;
};

type ChainUpdate = {
  Type: 'current' | 'revert' | 'apply';
  Val: ChangeVal;
};

const chainReducer = (state: TipSet[], action: ChainUpdate): TipSet[] => {
  switch (action.Type) {
    case 'current':
    case 'apply':
      return [
        ...state,
        {
          height: action.Val.Height,
          blocks: action.Val.Blocks.map((bl) => ({
            miner: bl.Miner,
            timestamp: bl.Timestamp,
          })),
        },
      ];
    case 'revert':
      return state.slice(0, -1);
    default:
      return state;
  }
};

const Chain = () => {
  const [chain, dispatch] = useReducer(chainReducer, []);

  useEffect(() => {
    const onChange = async (updates: ChainUpdate[]) => {
      console.log(updates);
      const tipsetKey = updates[0].Val.Cids;

      /* const msgs = await client.mpoolPending([]); */

      /* updates.forEach(dispatch); */
    };
    /* client.chainNotify(onChange); */
  }, []);

  return (
    <>
      {chain.map((tipset) => (
        <Card key={tipset.height}>
          <Text is="h3">{tipset.height}</Text>
        </Card>
      ))}
    </>
  );
};

export default Chain;
