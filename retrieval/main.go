package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/ipfs/go-cid"
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

const HandshakeTopic = "/myel/handshake/1.0.0"
const RPCPort = ":4321"

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
	hs, err := NewChannel(ctx, HandshakeTopic, ps, h.ID())
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

	// Now we can startup our lotus rpc
	fcw, closer, err := NewFilecoinWrapper()
	defer closer()
	if err != nil {
		return err
	}
	donec := make(chan struct{}, 1)
	newCids := make(chan *cid.Cid, 20)
	v := &Valve{
		Self:    h.ID(),
		Dict:    make(map[string]cid.Cid),
		Updates: newCids,
		hs:      hs,
		fcw:     fcw,
		ps:      ps,
		ctx:     ctx,
		disc:    disc,
	}
	go serveRPC(v)
	go v.Open()

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

// =================================================================================
// Expose RPC methods to UI

type RetrievalServerHandler struct {
	n int
	v *Valve
}

func (h *RetrievalServerHandler) AddGet(in int) int {
	h.n += in
	return h.n
}

func (h *RetrievalServerHandler) NewCidNotify() <-chan *cid.Cid {
	return h.v.Updates
}

func serveRPC(v *Valve) error {
	serverHandler := &RetrievalServerHandler{
		v: v,
	}
	rpcServer := jsonrpc.NewServer()
	rpcServer.Register("MyelRetrieval", serverHandler)

	http.Handle("/rpc/v0", rpcServer)
	log.Info().Str("port", RPCPort).Msg("Starting RPC")
	return http.ListenAndServe(RPCPort, nil)
}

// ==================================================================================
// Faucet connection and business logic
type Valve struct {
	Self peer.ID
	// dictionary to keep track of our deals
	Dict map[string]cid.Cid
	// broadcast new content
	Updates chan *cid.Cid
	// keep reference of the handshake enabling the Valve
	hs *Channel
	// connection with our lotus node
	fcw *FilecoinWrapper
	// keep our pubsub instance to listen to new topics
	ps *pubsub.PubSub

	ctx context.Context
	// keep track of peer discovery
	disc *DiscoveryNotifee
}

func (v *Valve) Open() error {
	// block execution until we find the faucet we expect a single peer at this point
	peer := <-v.disc.ConnectedPeers
	log.Info().Str("peerID", peer.ID.Pretty()).Msg("Added new peer to channel")

	id, err := v.fcw.CurrentUserID()
	if err != nil {
		return err
	}

	err = v.hs.Publish(id.String())
	if err != nil {
		return err
	}
	topic := fmt.Sprintln("/myel/faucet/", id, "/1.0.0")
	c, err := NewChannel(v.ctx, topic, v.ps, v.Self)
	if err != nil {
		return err
	}
	m := <-c.Messages
	go v.HandlePiece(m.Payload)
	return nil
}

// TODO:
// 1) Retrieve content associated with a piece
// 2) Open pubsub channel to start sending events
// 3) Handle deal requests about a piece
func (v *Valve) HandlePiece(rawCid string) error {
	log.Info().Str("cid", rawCid).Msg("New message received")
	c, err := cid.Decode(rawCid)
	if err != nil {
		return fmt.Errorf("Unable to decode received cid: %s", err)
	}
	v.Updates <- &c
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

const BufSize = 128
type Channel struct {
	// Messages is a channel of request and responses for faucet access
	Messages chan *Message

	ctx   context.Context
	ps    *pubsub.PubSub
	topic *pubsub.Topic
	sub   *pubsub.Subscription

	self peer.ID
}

type Message struct {
	Payload  string
	SenderID string
}

func NewChannel(ctx context.Context, topicName string, ps *pubsub.PubSub, selfID peer.ID) (*Channel, error) {
	topic, err := ps.Join(topicName)
	if err != nil {
		return nil, err
	}

	sub, err := topic.Subscribe()
	if err != nil {
		return nil, err
	}

	c := &Channel{
		ctx:      ctx,
		ps:       ps,
		sub:      sub,
		self:     selfID,
		topic:    topic,
		Messages: make(chan *Message, BufSize),
	}
	log.Info().Msg("Starting channel read loop")
	go c.ReadLoop()
	return c, nil
}

// ReadLoop pulls messages from the pubsub topic and pushes them onto the Messages channel.
func (c *Channel) ReadLoop() {
	for {
		msg, err := c.sub.Next(c.ctx)
		if err != nil {
			close(c.Messages)
			return
		}
		// only forward messages delivered by others
		if msg.ReceivedFrom == c.self {
			continue
		}
		cm := new(Message)
		err = json.Unmarshal(msg.Data, cm)
		if err != nil {
			continue
		}
		// send valid messages onto the Messages channel
		c.Messages <- cm
	}
}

// Publish sends messages to the pubsub topic
func (c *Channel) Publish(msg string) error {
	log.Info().Str("msg", msg).Msg("Publishing")
	m := Message{
		Payload:  msg,
		SenderID: c.self.Pretty(),
	}
	msgBytes, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return c.topic.Publish(c.ctx, msgBytes)
}
