package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/p2p/discovery"
)

func main() {
	if err := run(); err != nil {
		log.Fatal().Err(err).Msg("Received err from run func, exiting...")
	}
}

func run() error {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	h, err := libp2p.New(ctx, libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0"))
	if err != nil {
		return fmt.Errorf("Unable to create libp2p host: %s", err)
	}
	selfID := h.ID()
	log.Info().Str("selfID", selfID.String()).Msg("libp2p host started")

	ps, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		return fmt.Errorf("Unable to create gossip sub client: %s", err)
	}

	_, err = NewHandshake(ctx, ps, selfID)
	if err != nil {
		return fmt.Errorf("Unable to subscribe to handshake topic: %s", err)
	}

	for _, addr := range h.Addrs() {
		log.Info().Str("addr", addr.String()).Msg("Listening on")
	}

	// setup local mDNS discovery
	err = setupDiscovery(ctx, h)
	if err != nil {
		return fmt.Errorf("Unable to setup local mDNS discovery: %s", err)
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

// ==================================================================
// Peer discovery can prob be reused between nodes as well
const DiscoveryInterval = time.Hour
const DiscoveryServiceTag = "Myel"

type discoveryNotifee struct {
	h host.Host
}

func (n *discoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	fmt.Printf("discovered new peer %s\n", pi.ID.Pretty())
	err := n.h.Connect(context.Background(), pi)
	if err != nil {
		fmt.Printf("error connecting to peer %s: %s\n", pi.ID.Pretty(), err)
	}
}

func setupDiscovery(ctx context.Context, h host.Host) error {
	// setup mDNS discovery to find local peers
	disc, err := discovery.NewMdnsService(ctx, h, DiscoveryInterval, DiscoveryServiceTag)
	if err != nil {
		return err
	}

	n := discoveryNotifee{h: h}
	disc.RegisterNotifee(&n)
	return nil
}

// ==================================================================
// Handshake protocol to be moved in its own module for reusing

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
	go hs.readLoop()
	return hs, nil
}

// readLoop pulls messages from the pubsub topic and pushes them onto the Messages channel.
func (hs *Handshake) readLoop() {
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

// Publis sends messages to the pubsub topic
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
