package main

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	mbig "math/big"
	"math/rand"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/filecoin-project/go-fil-markets/storagemarket"
	"github.com/filecoin-project/go-jsonrpc"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/api/client"
	"github.com/filecoin-project/lotus/build"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/abi/big"
	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/peterbourgon/ff/v3"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const ImportPath = "myel-tmp"

func main() {
	if err := runTestScenario(); err != nil {
		log.Fatal().Err(err).Msg("Received err from run func, exiting...")
	}
}

func runTestScenario() error {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	ctx := context.Background()

	fs := flag.NewFlagSet("client", flag.ExitOnError)
	authToken := fs.String("auth_token", "", "authorization token for lotus daemon")

	if err := ff.Parse(fs, os.Args[1:],
		ff.WithEnvVarPrefix("HACKFS_NODE"),
	); err != nil {
		return fmt.Errorf("Unable to parse flags: %s", err)
	}
	client, closer, err := createFullNode(authToken, "1234")
	defer closer()
	if err != nil {
		return err
	}
	ask, mInfo, err := GetRandMinerAsk(ctx, client)
	if err != nil {
		return err
	}
	// err = initPaymentChannel(ctx, client, minerInfo)
	// if err != nil {
	// 	return err
	// }

	time.Sleep(12 * time.Second)
	home, err := os.Getwd()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(ImportPath, 0700); err != nil {
		return err
	}

	data := make([]byte, 1600)
	rand.New(rand.NewSource(time.Now().UnixNano())).Read(data)
	file, err := ioutil.TempFile(ImportPath, "data")
	if err != nil {
		return fmt.Errorf("Unable to create temporary data file: %s", err)
	}
	defer os.RemoveAll(ImportPath)
	_, err = file.Write(data)
	if err != nil {
		return err
	}
	filePath := path.Join(home, file.Name())
	log.Info().Str("file", file.Name()).Msg("Looking for")

	fileCid, err := client.ClientImport(ctx, api.FileRef{Path: filePath, IsCAR: false})
	if err != nil {
		return fmt.Errorf("Unable to import data file in the client: %v", err)
	}
	log.Info().Str("fcid", fileCid.String()).Msg("Imported file")

	deal, err := StartDeal(ctx, client, ask, mInfo, fileCid)
	if err != nil {
		return err
	}
	time.Sleep(2 * time.Second)

	err = WaitDealSealed(ctx, client, deal)
	if err != nil {
		return err
	}

	return nil
}

func createFullNode(token *string, port string) (api.FullNode, jsonrpc.ClientCloser, error) {
	endpoint := fmt.Sprint("ws://localhost:", port, "/rpc/v0")
	rpc, closer, err := client.NewFullNodeRPC(endpoint, http.Header{
		"Authorization": []string{fmt.Sprintf("Bearer %s", *token)},
	})
	if err != nil {
		log.Error().
			Err(err).
			Str("auth token", *token).
			Msg("Unable to connect to lotus daemon - should confirm the daemon running and an authentication token is supplied")

		return nil, nil, fmt.Errorf("unable to create common RPC client: %s", err)
	}
	log.Info().Str("port", port).Msg("Connected to lotus daemon")
	return rpc, closer, nil
}

// Get the first miner we can connect to
func GetRandMinerAsk(ctx context.Context, c api.FullNode) (*storagemarket.StorageAsk, api.MinerInfo, error) {
	miners, err := c.StateListMiners(ctx, types.EmptyTSK)
	if err != nil {
		return nil, api.MinerInfo{}, fmt.Errorf("Unable to retrieve miners: %s", err)
	}
	peers, err := c.NetPeers(ctx)
	if err != nil {
		return nil, api.MinerInfo{}, fmt.Errorf("Unable to list peers on the network: %s", err)
	}
	// create a lookup table for our peers
	plook := make(map[peer.ID]peer.AddrInfo)
	for _, p := range peers {
		plook[p.ID] = p
	}

	for _, miner := range miners {
		minerInfo, err := c.StateMinerInfo(ctx, miner, types.EmptyTSK)
		if err != nil {
			log.Info().Err(err).Str("address", miner.String()).Msg("Unable to retrieve miner info")
			continue
		}
		pid := peer.ID(minerInfo.PeerId)
		if p, ok := plook[pid]; ok {
			if err := c.NetConnect(ctx, p); err != nil {
				log.Info().Err(err).Msg("Failed to connect to miner")
				continue
			}
			log.Info().Str("miner", miner.String()).Msg("Connected with a miner")
			// Miner ask doesn't seem to work on testnet so we just fallback to the miner info
			sa, err := c.ClientQueryAsk(ctx, pid, minerInfo.Owner)
			if err != nil {
				log.Info().Err(err).Str("miner", miner.String()).Msg("Failed to get storage ask from miner")
				return nil, minerInfo, nil
			}

			return sa.Ask, minerInfo, nil
		}
		continue
	}

	return nil, api.MinerInfo{}, fmt.Errorf("Unable to connect to any miner")
}

// filToAttoFil converts a fractional filecoin value into AttoFIL, rounding if necessary
func filToAttoFil(f float64) big.Int {
	a := mbig.NewFloat(f)
	a.Mul(a, mbig.NewFloat(float64(build.FilecoinPrecision)))
	i, _ := a.Int(nil)
	return big.Int{Int: i}
}

func initPaymentChannel(ctx context.Context, cl api.FullNode, miner api.MinerInfo) error {
	balance := filToAttoFil(10)
	log.Info().Msg("Creating payment channel")
	clAddr, err := cl.WalletDefaultAddress(ctx)
	if err != nil {
		return fmt.Errorf("Unable to retrieve default address: %s", err)
	}
	channel, err := cl.PaychGet(ctx, clAddr, miner.Owner, balance)
	if err != nil {
		return fmt.Errorf("Unable to create payment channel: %s", err)
	}
	// wait for channel creation message to appear on chain
	_, err = cl.StateWaitMsg(ctx, channel.ChannelMessage, 2)
	if err != nil {
		return fmt.Errorf("Unable to wait for payment channel creation msg to appear on chain: %w", err)
	}

	log.Info().Msg("Reloading channel now it should have an address")
	channel, err = cl.PaychGet(ctx, clAddr, miner.Owner, big.Zero())
	if err != nil {
		return fmt.Errorf("failed to reload payment channel: %w", err)
	}

	return nil
}

func StartDeal(ctx context.Context, cl api.FullNode, ask *storagemarket.StorageAsk, mInfo api.MinerInfo, fcid cid.Cid) (*cid.Cid, error) {
	clAddr, err := cl.WalletDefaultAddress(ctx)
	if err != nil {
		return nil, err
	}
	var price types.BigInt
	if ask != nil {
		price = ask.Price
	} else {
		price = types.NewInt(1000)
	}
	deal, err := cl.ClientStartDeal(ctx, &api.StartDealParams{
		Data: &storagemarket.DataRef{
			TransferType: storagemarket.TTGraphsync,
			Root:         fcid,
		},
		Wallet:            clAddr,
		Miner:             mInfo.Owner,
		EpochPrice:        price,
		MinBlocksDuration: 640000,
		// FastRetrieval:     true,
	})
	if err != nil {
		return nil, fmt.Errorf("Unable to start deal: %s", err)
	}
	return deal, nil
}

func WaitDealSealed(ctx context.Context, cl api.FullNode, deal *cid.Cid) error {
	height := 0
	headlag := 3

	cctx, cancel := context.WithCancel(ctx)
	defer cancel()

	tipsetsCh, err := GetTips(cctx, cl, abi.ChainEpoch(height), headlag)
	if err != nil {
		return err
	}

	for tipset := range tipsetsCh {
		log.Info().Int("tipset", int(tipset.Height())).Msg("Got tipset")

		di, err := cl.ClientGetDealInfo(ctx, *deal)
		if err != nil {
			return err
		}
		switch di.State {
		case storagemarket.StorageDealProposalRejected:
			return fmt.Errorf("deal rejected")
		case storagemarket.StorageDealFailing:
			return fmt.Errorf("deal failed")
		case storagemarket.StorageDealError:
			return fmt.Errorf("deal errored: %s", di.Message)
		case storagemarket.StorageDealActive:
			log.Info().Msg("Deal completed")
			return nil
		}
	}
	return nil
}
