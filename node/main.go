package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/filecoin-project/lotus/api"
	client "github.com/filecoin-project/lotus/api/client"
	"github.com/filecoin-project/lotus/chain/types"
)

const exitFail = 1

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(exitFail)
	}
}

type server struct {
	// TODO: db
	rpc api.FullNode
}

func run() error {
	rpc, closer, err := client.NewFullNodeRPC("ws://localhost:1234/rpc/v0", http.Header{
		"Authorization": []string{fmt.Sprintf("Bearer %s", os.Getenv("AUTH_TOKEN"))},
	})
	if err != nil {
		return fmt.Errorf("unable to create common RPC client: %s", err)
	}

	defer closer()

	s := server{
		rpc: rpc,
	}

	return http.ListenAndServe(":8080", s)
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
			log.Printf("unable to retrieve miner info: %s", err)
			errJSON(w, err)
			return
		}

		bytes, err := json.Marshal(info)
		if err != nil {
			log.Printf("unable to marshal miner info JSON: %s", err)
			errJSON(w, err)
			return
		}

		_, err = w.Write(bytes)
		if err != nil {
			fmt.Printf("An error occurred writing back to client: %s\n", err)
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

	minerInfos := make([]api.MinerInfo, len(addrs))

	fmt.Println(len(addrs))

	for i, addr := range addrs[:50] {
		minerInfo, err := s.rpc.StateMinerInfo(ctx, addr, types.EmptyTSK)
		if err != nil {
			continue
			// return nil, fmt.Errorf("unable to retrieve miner info: %s", err)
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
			fmt.Printf("An error occurred writing back to client: %s\n", err)
		}
	}

	_, err = w.Write(bytes)
	if err != nil {
		fmt.Printf("An error occurred writing back to client: %s\n", err)
	}
}
