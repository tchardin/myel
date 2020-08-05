package main

// This is pretty much reworked from lotus stats module to avoid importing other hairy binaries

import (
	"container/list"
	"context"
	"time"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/abi"

	"github.com/rs/zerolog/log"
)

const (
	HCRevert  = "revert"
	HCApply   = "apply"
	HCCurrent = "current"
)

func GetTips(ctx context.Context, api api.FullNode, lastHeight abi.ChainEpoch, headlag int) (<-chan *types.TipSet, error) {
	chmain := make(chan *types.TipSet)

	hb := NewHeadBuffer(headlag)

	notif, err := api.ChainNotify(ctx)
	if err != nil {
		return nil, err
	}

	go func() {
		defer close(chmain)

		ping := time.Tick(30 * time.Second)

		for {
			select {
			case changes := <-notif:
				for _, change := range changes {

					switch change.Type {
					case HCCurrent:
						tipsets, err := loadTipsets(ctx, api, change.Val, lastHeight)
						if err != nil {
							log.Info().Err(err).Msg("Failed loading tipsets")
							return
						}

						for _, tipset := range tipsets {
							chmain <- tipset
						}
					case HCApply:
						if out := hb.Push(change); out != nil {
							chmain <- out.Val
						}
					case HCRevert:
						hb.Pop()
					}
				}
			case <-ping:
				log.Info().Msg("Running health check")

				cctx, cancel := context.WithTimeout(ctx, 5*time.Second)

				if _, err := api.ID(cctx); err != nil {
					log.Info().Err(err).Msg("Health check failed")
					cancel()
					return
				}

				cancel()

				log.Info().Msg("Node online")
			case <-ctx.Done():
				return
			}
		}
	}()

	return chmain, nil
}

func loadTipsets(ctx context.Context, api api.FullNode, curr *types.TipSet, lowestHeight abi.ChainEpoch) ([]*types.TipSet, error) {
	tipsets := []*types.TipSet{}
	for {
		if curr.Height() == 0 {
			break
		}

		if curr.Height() <= lowestHeight {
			break
		}

		tipsets = append(tipsets, curr)

		tsk := curr.Parents()
		prev, err := api.ChainGetTipSet(ctx, tsk)
		if err != nil {
			return tipsets, err
		}

		curr = prev
	}

	for i, j := 0, len(tipsets)-1; i < j; i, j = i+1, j-1 {
		tipsets[i], tipsets[j] = tipsets[j], tipsets[i]
	}

	return tipsets, nil
}

type headBuffer struct {
	buffer *list.List
	size   int
}

func NewHeadBuffer(size int) *headBuffer {
	buffer := list.New()
	buffer.Init()

	return &headBuffer{
		buffer: buffer,
		size:   size,
	}
}

func (h *headBuffer) Push(hc *api.HeadChange) (rethc *api.HeadChange) {
	if h.buffer.Len() == h.size {
		var ok bool

		el := h.buffer.Front()
		rethc, ok = el.Value.(*api.HeadChange)
		if !ok {
			panic("Value from list is not the correct type")
		}

		h.buffer.Remove(el)
	}

	h.buffer.PushBack(hc)

	return
}

func (h *headBuffer) Pop() {
	el := h.buffer.Back()
	if el != nil {
		h.buffer.Remove(el)
	}
}
