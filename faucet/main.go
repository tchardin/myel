package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"os/signal"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/p2p/discovery"
	"github.com/multiformats/go-multiaddr"

	"github.com/oschwald/maxminddb-golang"
	"github.com/textileio/powergate/util"
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

	// setup ip location db
	geo, err := NewGeoIp("GeoLite2-City.mmdb")
	if err != nil {
		return fmt.Errorf("Unable to find geoip2 database: %s", err)
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	spk := &Sprinkler{
		Pending: make(chan *Target),
		Topics:  make(map[string]*Channel),
		Self:    selfID,
		ctx:     ctx,
		ps:      ps,
		h:       h,
		geo:     geo,
	}
	go spk.LoadTargets(hs)
	go spk.Start()

	select {
	case <-stop:
		log.Info().Msg("Shutting down")
		h.Close()
		geo.db.Close()
		os.Exit(0)
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
	Topics  map[string]*Channel

	ctx context.Context
	ps  *pubsub.PubSub
	h   host.Host
	geo *GeoIp
}

func (s *Sprinkler) Start() {
	for t := range s.Pending {
		if c, ok := s.Topics[topicName(t.MinerID)]; ok {
			c.Publish(ExampleCid)
		} else {
			go s.StartChannel(t)
		}
	}
}

func (s *Sprinkler) StartChannel(t *Target) error {
	topic := topicName(t.MinerID)
	c, err := NewChannel(s.ctx, topic, s.ps, s.Self)
	if err != nil {
		log.Error().Err(err).Str("topic", topic).Msg("Failed to start new pubsub channel")
		return fmt.Errorf("Failed to start new pubsub channel")
	}
	log.Info().Str("topic", topic).Msg("Listening to topic")
	// keep track of opened channels in case we get another request
	s.Topics[topic] = c
	// convert string to peer .ID
	pID, err := peer.IDB58Decode(t.PeerID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to convert peer ID")
		return fmt.Errorf("Failed to convert peer ID: %s", err)
	}
	// Get peer addr info
	pInfo := s.h.Peerstore().PeerInfo(pID)
	log.Info().Str("pInfo", pInfo.String()).Msg("Extracted peer address")
	loc, err := s.geo.Resolve(pInfo.Addrs)
	if err != nil {
		// we should still handle peer if we can't resolve their location
		// though we should prob warn them the results won't be as good
	}
	log.Info().Str("country", loc.Country).Msg("resolved peer location")

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

func topicName(name string) string {
	return fmt.Sprint("/myel/faucet/", name, "/1.0.0")
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
		ConnectedPeers: make(chan *peer.AddrInfo),
	}
	disc.RegisterNotifee(n)
	return n, nil
}

// ==================================================================
// Handshake protocol to be moved in its own module for reusing

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
		Messages: make(chan *Message),
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

// ===============================================================================
// Resolving peer location from their ip addresses

type GeoIp struct {
	db *maxminddb.Reader
}

type IpLocation struct {
	Country string
	Lat     float64
	Lon     float64
}

func NewGeoIp(path string) (*GeoIp, error) {
	db, err := maxminddb.Open(path)
	if err != nil {
		return nil, err
	}
	return &GeoIp{db: db}, nil
}

func (geo *GeoIp) Resolve(multiaddrs []multiaddr.Multiaddr) (IpLocation, error) {
	for _, addr := range multiaddrs {
		ipport, err := util.TCPAddrFromMultiAddr(addr)
		if err != nil {
			log.Error().Err(err).Msg("Failed to transform multiddr to tcp addr")
			continue
		}
		strIP, _, err := net.SplitHostPort(ipport)
		if err != nil {
			log.Error().Err(err).Msg("Failed to parse ip/port")
			continue
		}
		ip := net.ParseIP(strIP)
		var city struct {
			Country struct {
				ISOCode string `maxminddb:"iso_code"`
			} `maxminddb:"country"`
			Location struct {
				Latitude  float64 `maxminddb:"latitude"`
				Longitude float64 `maxminddb:"longitude"`
			} `maxminddb:"location"`
		}
		err = geo.db.Lookup(ip, &city)
		if err != nil {
			log.Error().Err(err).Str("ip", strIP).Msg("Failed to find ip in geoip2")
			continue
		}
		fmt.Printf("%+v\n", city)
		if city.Country.ISOCode != "" || (city.Location.Latitude != 0 && city.Location.Longitude != 0) {
			return IpLocation{
				Country: city.Country.ISOCode,
				Lat:     city.Location.Latitude,
				Lon:     city.Location.Longitude,
			}, nil
		}
		log.Info().Str("ip", ip.String()).Msg("No info for addr")
	}
	return IpLocation{}, fmt.Errorf("Cannot resolve multiaddr location")
}
