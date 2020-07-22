# node

Node is a JSON-RPC server that sits over the lotus daemon.
The daemon must be running to start the server.

The server can be started by either setting the `HACKFS_NODE_AUTH_TOKEN` env var to the output of `lotus auth create-token --perm admin`, and running:

```commandline
go run main.go
```

or, the auth token can be supplied at the CLI:

```commandline
go run main.go -auth_token <auth token here>
```
