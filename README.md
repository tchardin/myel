# Myel

Easy Filecoin retrieval mining

## Getting Started

We are currently working on a good way to test the whole system e2e. In the meantime you can run some parts separately.

### Installing lotus

Please follow instructions in the [lotus documentation](https://lotu.sh/).

### Running the faucet node

```
cd faucet
go run .
```

### Running the retrieval client

First you need to get an admin token from your lotus node

```
lotus auth api-info --perm admin
```

Then either set it as an env variable `MYEL_RETRIEVAL_AUTH_TOKEN` or directly
```
cd retrieval
go run . -auth_token <auth token here>
```

### Running the UI

You can check out the UI in a synced [codesanbox](https://codesandbox.io/s/github/tchardin/hackfs/tree/dev/ui)
or run locally 
```
cd ui
yarn
yarn start
```


## Architecture

A miner can run our retrieval client on top of their lotus node. The retrieval client can discover another type of node, which we call faucet node, via libp2p and subscribe through gossipsub to get immediate access to a stream of CIDs of content to retrieve. The retrieval clients sends back events about the CIDs they serve.

Events include information about any client requesting the CID as well as metrics surrounding the data transactions. This includes for example the location of the client or the latency of the network transaction. The faucet node writes in a database which miner was assigned to a CID and the events resulting from that pairing. Further, the faucet aims to match a retrieval miner to the CID which maximizes the potential amount of Filecoin they can earn. It does so by using a prediction model trained on the database of events which predicts the amount of Filecoin collected for a given Miner-CID pair.

The project features 3 different go apps. 1 runs a storage client to test e2e deal flows, 2 is a faucet node which runs libp2p and gossipsub protocol as well as a maxminddb for locating peer ips, 3 is a retrieval client featuring a lotus rpc client to communicate with a lotus node, a libp2p host with gossipsub and its own grpc implementation for connecting to the frontend. Lastly, the frontend is a react-native application (running in web but aiming at making an iPad app for miners) built in typescript, with recoil for state management.

## Acknowledgments

Thanks to @svanburen for his contribution and guidance on golang architecture and best practices. 
