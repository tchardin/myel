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

const HandshakeTopic = "/myel/handshake/1.0.0"

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

	hs, err := NewChannel(ctx, HandshakeTopic, ps, selfID)
	if err != nil {
		return fmt.Errorf("Unable to subscribe to handshake topic: %s", err)
	}

	for _, addr := range h.Addrs() {
		log.Info().Str("addr", addr.String()).Msg("Listening on")
	}

	// setup local mDNS discovery
	_, err = setupDiscovery(ctx, h)
	if err != nil {
		return fmt.Errorf("Unable to setup local mDNS discovery: %s", err)
	}

	donec := make(chan struct{}, 1)

	spk := &Sprinkler{
		Pending: make(chan *Target, 1),
		Self:    selfID,
		ctx:     ctx,
		ps:      ps,
	}
	go spk.LoadTargets(hs)
	go spk.Start()

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

const ExampleCid = "bafkreicj7sktcsxh5kxcz6bbqjpthlqns3xk6tdb5arlkjr3znbyqzilbi"

type Target struct {
	MinerID string
	PeerID  string
}

// interface to sprinkle new cids across the network
type Sprinkler struct {
	Pending chan *Target
	Self    peer.ID

	ctx context.Context
	ps  *pubsub.PubSub
}

func (s *Sprinkler) Start() {
	for t := range s.Pending {
		go s.StartChannel(t)
	}
}

func (s *Sprinkler) StartChannel(t *Target) error {
	topic := fmt.Sprintln("/myel/faucet/", t.MinerID, "/1.0.0")
	c, err := NewChannel(s.ctx, topic, s.ps, s.Self)

	if err != nil {
		log.Error().Err(err).Str("topic", topic).Msg("Failed to start new pubsub channel")
		return fmt.Errorf("Failed to start new pubsub channel")
	}
	c.Publish(ExampleCid)
	return nil
}

// Handle handshake requests
func (s *Sprinkler) LoadTargets(c *Channel) {
	for m := range c.Messages {
		log.Info().Str("miner", m.Payload).Msg("New message received")
		s.Pending <- &Target{
			MinerID: m.Payload,
			PeerID:  m.SenderID,
		}
	}
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

// ==================================================================
// Handshake protocol to be moved in its own module for reusing

// might need to pass as a param to NewChannel too
const BufSize = 128
// Channel represents a subscription to a topic
type Channel struct {
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
	go c.readLoop()
	return c, nil
}

// readLoop pulls messages from the pubsub topic and pushes them onto the Messages channel.
func (c *Channel) readLoop() {
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
		m := new(Message)
		err = json.Unmarshal(msg.Data, m)
		if err != nil {
			continue
		}
		// send valid messages onto the Messages channel
		c.Messages <- m
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
