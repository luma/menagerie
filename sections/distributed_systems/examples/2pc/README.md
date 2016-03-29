# 2-phase-commit example


## Theory

See the **2-phase-commit** section from the [Replication and Consensus](../../replication_and_consensus.md) doc

## Prerequisites

It assumes a NATs server is up and running on 0.0.0.0:4222. I'd recommend that you install  [this](https://github.com/nats-io/gnatsd) one.

Run `npm i` to ensure that you have all the node dependencies.

## Running

Run the example with `npm test`


## TODO

* implement a proper fsm for coordinator
* implement a proper fsm for cohort
