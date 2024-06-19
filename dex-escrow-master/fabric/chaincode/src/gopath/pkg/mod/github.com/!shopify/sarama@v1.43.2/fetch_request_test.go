package sarama

import "testing"

var (
	fetchRequestNoBlocks = []byte{
		0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
	}

	fetchRequestWithProperties = []byte{
		0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0xEF,
		0x00, 0x00, 0x00, 0x00,
	}

	fetchRequestOneBlock = []byte{
		0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x05, 't', 'o', 'p', 'i', 'c',
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x34, 0x00, 0x00, 0x00, 0x56,
	}

	fetchRequestOneBlockV4 = []byte{
		0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0xFF,
		0x01,
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x05, 't', 'o', 'p', 'i', 'c',
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x34, 0x00, 0x00, 0x00, 0x56,
	}

	fetchRequestOneBlockV11 = []byte{
		0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0xFF,
		0x01,
		0x00, 0x00, 0x00, 0xAA, // sessionID
		0x00, 0x00, 0x00, 0xEE, // sessionEpoch
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x05, 't', 'o', 'p', 'i', 'c',
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x12, // partitionID
		0x00, 0x00, 0x00, 0x66, // currentLeaderEpoch
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x34, // fetchOffset
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // logStartOffset
		0x00, 0x00, 0x00, 0x56, // maxBytes
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x06, 'r', 'a', 'c', 'k', '0', '1', // rackID
	}
)

func TestFetchRequest(t *testing.T) {
	t.Run("no blocks", func(t *testing.T) {
		request := new(FetchRequest)
		testRequest(t, "no blocks", request, fetchRequestNoBlocks)
	})

	t.Run("with properties", func(t *testing.T) {
		request := new(FetchRequest)
		request.MaxWaitTime = 0x20
		request.MinBytes = 0xEF
		testRequest(t, "with properties", request, fetchRequestWithProperties)
	})

	t.Run("one block", func(t *testing.T) {
		request := new(FetchRequest)
		request.MaxWaitTime = 0
		request.MinBytes = 0
		request.AddBlock("topic", 0x12, 0x34, 0x56, -1)
		testRequest(t, "one block", request, fetchRequestOneBlock)
	})

	t.Run("one block v4", func(t *testing.T) {
		request := new(FetchRequest)
		request.Version = 4
		request.MaxBytes = 0xFF
		request.Isolation = ReadCommitted
		request.AddBlock("topic", 0x12, 0x34, 0x56, -1)
		testRequest(t, "one block v4", request, fetchRequestOneBlockV4)
	})

	t.Run("one block v11 rackid and leader epoch", func(t *testing.T) {
		request := new(FetchRequest)
		request.Version = 11
		request.MaxBytes = 0xFF
		request.Isolation = ReadCommitted
		request.SessionID = 0xAA
		request.SessionEpoch = 0xEE
		request.AddBlock("topic", 0x12, 0x34, 0x56, 0x66)
		request.RackID = "rack01"
		testRequest(t, "one block v11 rackid", request, fetchRequestOneBlockV11)
	})
}
