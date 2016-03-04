# Fault tolerance


The basic tension of fault tolerance

A system that tolerates some faults without degrading must be able to act as though those faults had not occurred. This means usually that parts of the system must do work redundantly, but doing more work than is absolutely necessary typically carries a cost both in performance and resource consumption. This is the basic tension of adding fault tolerance to a system.

You should know:


* The (partial) hierarchy of failure modes: crash [stop -> omission](http://www.liafa.jussieu.fr/~cd/rech/disc07.pdf) -> [Byzantine])(http://en.wikipedia.org/wiki/Byzantine_fault_tolerance). You should understand that what is possible at the top of the hierarchy must be possible at lower levels, and what is impossible at lower levels must be impossible at higher levels.


* The quorum technique for ensuring single-copy serialisability. See [Skeen’s original paper](https://ecommons.library.cornell.edu/bitstream/1813/6323/1/82-483.pdf), but perhaps better is [Wikipedia’s entry](http://en.wikipedia.org/wiki/Quorum_(distributed_computing)).

* About [2-phase-commit](http://the-paper-trail.org/blog/consensus-protocols-two-phase-commit/), [3-phase-commit](http://the-paper-trail.org/blog/consensus-protocols-three-phase-commit/) and [Paxos](http://the-paper-trail.org/blog/consensus-protocols-paxos/), and why they have different fault-tolerance properties.

* How eventual consistency, and other techniques, seek to avoid this tension at the cost of weaker guarantees about system behaviour. The [Dynamo paper](http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) is a great place to start, but also Pat Helland’s classic [Life Beyond Transactions](http://www.ics.uci.edu/~cs223/papers/cidr07p15.pdf) is a must-read.
