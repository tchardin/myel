package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/p2p/discovery"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/go-jsonrpc"
	"github.com/filecoin-project/lotus/api"
	client "github.com/filecoin-project/lotus/api/client"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/peterbourgon/ff/v3"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	if err := run(); err != nil {
		log.Fatal().Err(err).Msg("Received err from run func, exiting...")
	}
}
func run() error {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	ctx := context.Background()

	// create a new libp2p Host that listens on a random TCP port
	h, err := libp2p.New(ctx, libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0"))
	if err != nil {
		return fmt.Errorf("Unable to create libp2p host: %s", err)
	}

	ps, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		return fmt.Errorf("Unable to create gossipsub client: %s", err)
	}
	hs, err := NewHandshake(ctx, ps, h.ID())
	if err != nil {
		return fmt.Errorf("Unable to start handshake channel: %s", err)
	}
	for _, addr := range h.Addrs() {
		log.Info().Str("addr", addr.String()).Msg("Listening on")
	}

	disc, err := setupDiscovery(ctx, h)
	if err != nil {
		return fmt.Errorf("Unable to setup local mDNS discovery: %s", err)
	}

	// block execution until we find the faucet
	peer := <-disc.ConnectedPeers
	log.Info().Str("peerID", peer.ID.Pretty()).Msg("Added new peer to channel")

	// Now we can startup our lotus rpc
	fcw, closer, err := NewFilecoinWrapper()
	defer closer()
	if err != nil {
		return err
	}
	time.Sleep(2 * time.Second)
	id, err := fcw.CurrentUserID()
	if err != nil {
		return err
	}

	err = hs.Publish(id.String())
	if err != nil {
		return err
	}

	donec := make(chan struct{}, 1)

	stop := make(chan os.Signal, 1)

	select {
	case <-stop:
		h.Close()
		os.Exit(0)
	case <-donec:
		h.Close()
	}
	return nil
}

// ==================================================================================
// Lotus rpc calls

type FilecoinWrapper struct {
	rpc api.FullNode
}

func NewFilecoinWrapper() (*FilecoinWrapper, jsonrpc.ClientCloser, error) {
	fs := flag.NewFlagSet("node", flag.ExitOnError)
	var (
		authToken = fs.String("auth_token", "", "authorization token for lotus daemon")
	)

	if err := ff.Parse(fs, os.Args[1:],
		ff.WithEnvVarPrefix("HACKFS_NODE"),
	); err != nil {
		return nil, nil, fmt.Errorf("Unable to parse flags: %s", err)
	}

	rpc, closer, err := client.NewFullNodeRPC("ws://localhost:1234/rpc/v0", http.Header{
		"Authorization": []string{fmt.Sprintf("Bearer %s", *authToken)},
	})
	if err != nil {
		log.Error().
			Err(err).
			Str("auth token", *authToken).
			Msg("Unable to connect to lotus daemon - should confirm the daemon running and an authentication token is supplied")

		return nil, nil, fmt.Errorf("unable to create common RPC client: %s", err)
	}
	log.Info().Msg("Connected to lotus daemon")

	fcw := &FilecoinWrapper{
		rpc: rpc,
	}
	return fcw, closer, nil
}

func (fcw *FilecoinWrapper) CurrentUserID() (address.Address, error) {
	ctx := context.Background()

	addr, err := fcw.rpc.WalletDefaultAddress(ctx)
	if err != nil {
		return address.Undef, fmt.Errorf("Unable to get wallet default address: %s", err)
	}
	id, err := fcw.rpc.StateLookupID(ctx, addr, types.EmptyTSK)
	if err != nil {
		return address.Undef, fmt.Errorf("Unable to lookup ID from address: %s", err)
	}

	return id, nil
}
// ==================================================================
// Peer discovery can prob be reused between nodes as well
const DiscoveryInterval = time.Hour
const DiscoveryServiceTag = "Myel"

type DiscoveryNotifee struct {
	h              host.Host
	ConnectedPeers chan *peer.AddrInfo
}

func (n *DiscoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	err := n.h.Connect(context.Background(), pi)
	if err != nil {
		fmt.Printf("error connecting to peer %s: %s\n", pi.ID.Pretty(), err)
	}
	n.ConnectedPeers <- &pi
}

func setupDiscovery(ctx context.Context, h host.Host) (*DiscoveryNotifee, error) {
	// setup mDNS discovery to find local peers
	disc, err := discovery.NewMdnsService(ctx, h, DiscoveryInterval, DiscoveryServiceTag)
	if err != nil {
		return nil, err
	}

	n := &DiscoveryNotifee{
		h:              h,
		ConnectedPeers: make(chan *peer.AddrInfo, 1),
	}
	disc.RegisterNotifee(n)
	return n, nil
}

// ================================================================================
// Handshake protocol - same code for faucet node

const HandshakeTopic = "/libp2p/myel-handshake/1.0.0"
const HandshakeBufSize = 128
// Handshake represents a subscription to the handshake topic for establishing the
// relationship between a miner and the faucet
type Handshake struct {
	// Messages is a channel of request and responses for faucet access
	Messages chan *HsMessage

	ctx   context.Context
	ps    *pubsub.PubSub
	topic *pubsub.Topic
	sub   *pubsub.Subscription

	self peer.ID
}

type HsMessage struct {
	Message  string
	SenderID string
}

func NewHandshake(ctx context.Context, ps *pubsub.PubSub, selfID peer.ID) (*Handshake, error) {
	topic, err := ps.Join(HandshakeTopic)
	if err != nil {
		return nil, err
	}

	sub, err := topic.Subscribe()
	if err != nil {
		return nil, err
	}

	hs := &Handshake{
		ctx:      ctx,
		ps:       ps,
		sub:      sub,
		self:     selfID,
		topic:    topic,
		Messages: make(chan *HsMessage, HandshakeBufSize),
	}
	log.Info().Msg("Starting handshake read loop")
	go hs.ReadLoop()
	return hs, nil
}

// ReadLoop pulls messages from the pubsub topic and pushes them onto the Messages channel.
func (hs *Handshake) ReadLoop() {
	for {
		msg, err := hs.sub.Next(hs.ctx)
		if err != nil {
			close(hs.Messages)
			return
		}
		// only forward messages delivered by others
		if msg.ReceivedFrom == hs.self {
			continue
		}
		cm := new(HsMessage)
		err = json.Unmarshal(msg.Data, cm)
		if err != nil {
			continue
		}
		// send valid messages onto the Messages channel
		hs.Messages <- cm
	}
}

// Publish sends messages to the pubsub topic
func (hs *Handshake) Publish(msg string) error {
	log.Info().Str("msg", msg).Msg("Publishing")
	m := HsMessage{
		Message:  msg,
		SenderID: hs.self.Pretty(),
	}
	msgBytes, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return hs.topic.Publish(hs.ctx, msgBytes)
}
