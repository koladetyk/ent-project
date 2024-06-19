package runhcs

import (
	"context"
)

// Kill sends the specified signal (default: SIGTERM) to the container's init
// process.
func (r *Runhcs) Kill(context context.Context, id, signal string) error {
	return r.runOrError(r.command(context, "kill", id, signal))
}
