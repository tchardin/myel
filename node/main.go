package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

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

type server struct {
	rpc api.FullNode
}

func run() error {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	fs := flag.NewFlagSet("node", flag.ExitOnError)

	var (
		port      = fs.String("port", "8080", "port for server to listen on")
		authToken = fs.String("auth_token", "", "authorization token for lotus daemon")
	)

	if err := ff.Parse(fs, os.Args[1:],
		ff.WithEnvVarPrefix("HACKFS_NODE"),
	); err != nil {
		return fmt.Errorf("Unable to parse flags: %s", err)
	}

	log.Info().Msg("Attempting to connect to lotus daemon")

	rpc, closer, err := client.NewFullNodeRPC("ws://localhost:1234/rpc/v0", http.Header{
		"Authorization": []string{fmt.Sprintf("Bearer %s", *authToken)},
	})
	if err != nil {
		log.Error().
			Err(err).
			Str("auth token", *authToken).
			Msg("Unable to connect to lotus daemon - should confirm the daemon running and an authentication token is supplied")

		return fmt.Errorf("unable to create common RPC client: %s", err)
	}

	defer closer()

	s := server{
		rpc: rpc,
	}

	log.Info().Str("port", *port).Msg("Starting server")

	return http.ListenAndServe(fmt.Sprintf(":%s", *port), s)
}

// RPCRequest is a generic request received by the HTTP server.
type RPCRequest struct {
	RPC string `json:"rpc"`
}

func (s server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Only POST is allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}

	var req RPCRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "unable to decode body JSON", http.StatusBadRequest)
		return
	}

	// everything from here onwards should be JSON

	w.Header().Set("Content-Type", "application/json")

	switch req.RPC {
	case "miner-info":
		info, err := s.MinerInfo()
		if err != nil {
			log.Error().Err(err).Msg("Unable to retrieve miner info")
			errJSON(w, err)

			return
		}

		bytes, err := json.Marshal(info)
		if err != nil {
			log.Error().Err(err).Msg("Unable to marshal miner info JSON")
			errJSON(w, err)

			return
		}

		_, err = w.Write(bytes)
		if err != nil {
			log.Error().Err(err).Msg("Unable to write back to client")
		}

	default:
		http.Error(w, "invalid RPC", http.StatusBadRequest)
	}
}

func (s server) MinerInfo() ([]api.MinerInfo, error) {
	ctx := context.Background()

	addrs, err := s.rpc.StateListMiners(ctx, types.EmptyTSK)
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve actors: %s", err)
	}

	// cap the number of miners to retrieve at 50
	minersToRetrieve := len(addrs)
	if minersToRetrieve > 50 {
		minersToRetrieve = 50
	}

	minerInfos := make([]api.MinerInfo, minersToRetrieve)

	for i, addr := range addrs[:minersToRetrieve] {
		minerInfo, err := s.rpc.StateMinerInfo(ctx, addr, types.EmptyTSK)
		if err != nil {
			log.Info().Err(err).Str("address", addr.String()).Msg("Unable to retrieve miner info")
			continue
		}

		minerInfos[i] = minerInfo
	}

	return minerInfos, nil
}

type errResponse struct {
	Error error `json:"err"`
}

func errJSON(w http.ResponseWriter, err error) {
	bytes, err := json.Marshal(errResponse{
		Error: err,
	})
	if err != nil {
		_, err = w.Write([]byte("{'err': 'An error occurred'}"))
		if err != nil {
			log.Error().Err(err).Msg("Unable to write back to client")
			return
		}
	}

	_, err = w.Write(bytes)
	if err != nil {
		log.Error().Err(err).Msg("Unable to write back to client")
		return
	}
}
