# Menagerie

My notes on various technical topics. These are being produced from an older version of my notes so this is very much WIP

At this point the only section that is in here is [Distributed Systems](distributed_systems/) which is also not complete.

## Getting started

1. Install [Rust](https://www.rust-lang.org/) using any method that you like then install [MDBook](http://azerupi.github.io/mdBook/) using cargo: `cargo install mdbook`
2. (Re)Build the book: `npm run build`
3. Open up all sections: `npm start`


## Usage and feedback

If you find these useful feel free to fork. If you have corrections or improvements please open an issue or pull request.

Where I'm quoting or referencing existing works there should always be a link back to the relevant paper or website. I may have borrowed a few images along the way, I need to review this and credit or replace as appropriate.

If you notice anywhere that I haven't credited the original sources please create an issue.

## TODO

## Software development practices

Everything right now, I've just begun to lay the outline.


### Distributed Systems

* failure
* fault tolerance
* consistent hashing
* merkle trees
* CRDTs
* testing
* hyperspace hashing
* security

#### Time, clocks, and ordering
* Dotted Vector Versions
* Atomic clocks, Spanner, and the TrueTime api


#### Replication and Consensus
* gossip protocols
* write some gossip example code
* CALM
* multi-paxos, fast paxos, generalized paxos, RAFT, ZAB
* summary
