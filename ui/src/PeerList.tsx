import * as React from 'react';
import {LotusClient} from './client/LotusProvider';

const getPeers = (client: LotusClient) => client.netPeers();

const PeerList = () => {
  return null;
};

export default PeerList;
