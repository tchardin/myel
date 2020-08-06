module github.com/tchardin/hackfs/client

go 1.14

require (
	github.com/filecoin-project/go-fil-markets v0.3.2-0.20200706104419-7c180fe156d4
	github.com/filecoin-project/go-jsonrpc v0.1.1
	github.com/filecoin-project/lotus v0.4.2-0.20200706172415-cf6ac44b6ec5
	github.com/filecoin-project/specs-actors v0.6.2-0.20200702170846-2cd72643a5cf
	github.com/ipfs/go-cid v0.0.7
	github.com/libp2p/go-libp2p-core v0.6.1
	github.com/peterbourgon/ff/v3 v3.0.0
	github.com/rs/zerolog v1.19.0
)

replace github.com/filecoin-project/filecoin-ffi => ./extern/filecoin-ffi
