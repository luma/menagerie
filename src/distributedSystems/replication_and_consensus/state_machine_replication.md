# Consensus: state machine replication

Master-slave and multi-phase commit (2PC+3PC) will all fail under network partitions. [Paxos](#paxos), [Raft](#raft), and [ZAB](#zab) use a state replication based approach that *is* partition tolerant and are widely used.

State Replication for consensus is basically Master-slave using leaders (coordinator), quorums, and replicas of operation logs (either as the full logs or deltas).

Like multi-phase commit a leader is chosen that will handle all changes and then broadcast them to the rest of the group. Each node in the group keeps it's own replica of the logs.

### Quorums: consensus by majority

Rather than requiring all participants to reply before committing these approaches only require a majority (quorum) to acknowledge. This means that systems using this approach will not deadlock if the minority of nodes becomes unavailable.

From [Replication](http://book.mixu.net/distsys/replication.html) on Distributed Systems for fun and profit:
> Partition tolerant consensus algorithms use an odd number of nodes (e.g. 3, 5 or 7). With just two nodes, it is not possible to have a clear majority after a failure. For example, if the number of nodes is three, then the system is resilient to one node failure; with five nodes the system is resilient to two node failures.

In fact, even if the system was partitioned into several smaller systems the largest system, assuming that it contains a majority of the pre-partitioned nodes, would still be able to function. The minority nodes would have to stop accepting writes to avoid diverging but would be able to rejoin the quorum if the partition heals.

### Sacrificing availability (liveness) for consistency

From [Consensus protocols: Paxos](http://the-paper-trail.org/blog/consensus-protocols-paxos/):
> Paxos was the first correct protocol which was provably resiliant in the face asynchronous networks. Remember that we must view all consensus protocols in the context of the FLP impossibility result which tells us that no protocol will be correct in all executions with an asynchronous network. Paxos withstands asynchronicity and waits it out until good behaviour is restored. Rather than sacrifice correctness, which some variants (including the one I described) of 3PC do, Paxos sacrifices liveness, i.e. guaranteed termination, when the network is behaving asynchronously and terminates only when synchronicity returns.

[Raft](#raft) and [ZAB](#zab) make similar tradeoffs.


### <a name="paxos">Paxos</a>

#### Assumptions

From page 1 of [Paxos made simple](#paxos_made_simple):
> Assume that agents can communicate with one another by sending messages. We use the customary asynchronous, non-Byzantine model, in which:
>
>* Agents operate at arbitrary speed, may fail by stopping, and may restart. Since all agents may fail after a value is chosen and then restart, a solution is impossible unless some information can be remembered by an agent that has failed and restarted.
>* Messages can take arbitrarily long to be delivered, can be duplicated, and can be lost, but they are not corrupted.

#### Terminology

Different papers and techniques tend to use different terminology for the same concepts. Below are the terms that Paxos uses.

* **Proposer**: the coordinator or master
* **Acceptors**: the cohorts in multi-phase speak
* **Learner**: learners are advised of results by acceptors and are the ones that actually commit the values once they have received a specific value from a majority of acceptors

#### Protocol

The core of Paxos is actually rather similar to 2-phase-commit. At a high level it looks like:

1. proposer (coordinator) sends a proposal to all of the acceptors
2. once the acceptors have agreed on the proposal the proposer sends a commit request to the acceptors
3. each acceptor commits the value and informs the learner
4. once enough acceptors have advised the proposer that the value is committed the protocol terminates

Paxos differs from 2PC in when a acceptor may accept a proposal and what value the proposer is allowed to eventually request for acceptance.

Another difference is that in Paxos there may be multiple proposers suggesting values at the same time. The protocol deals with this although it can be worth limiting the number of possible proposers (if possible) as too many can increase the time it takes to reach consensus.

A node in paxos can take on any or all of the three possible roles: proposer, acceptor, or learner. In most of the examples and diagrams below we assume a single node only takes a single role...less confusing that way.

![Basic Paxos architecture](images/paxos_architecture.png)



##### Determining ordering of proposals

One of the issues that multi-phase commit has is that cohorts being promoted when the coordinator is Fail-recover can cause split-brain and inconsistent state within the system (See an [example of this](#3pc_network_partition)). Paxos eliminates these types of issues by establishing a total order among proposals by tagging them with sequence numbers.

Sequence numbers must be a positive natural number. They must also be monotonically increasing and unique with respect to other proposers’ proposal numbers.

This allows acceptors and proposers to order proposals and know which are the newest. Acceptors can reject messages from old coordinators and them from disrupting consensus once it's achieved.

Coordinators must keep track of the most recent sequence numbers, they can then assign new proposals a unique sequence number that is higher that any previous ones that it knows. When it's ready to propose a value it can create a **propose** message with that sequence number.

When a proposal arrives, the acceptor checks to see if the proposals sequence number is newer (higher) than any that it's previously seen. If it is then the acceptor returns a promise to the proposer that guarantees that it won't accept any proposals that are older than the new proposal. If the new proposal number is older then the accept will reject the proposal and return the sequence number of the current proposal.

An important point about this system is that it allows the acceptors to agree on proposals **without** any extra communication. This helps with the consequences of us assuming an asynchronous system (see the [FLP Impossibility result](#flp_impossibility)).


##### Majorities

From Majorities in [Consensus Protocols: Paxos](http://the-paper-trail.org/blog/consensus-protocols-paxos/):
>One simple fact helps us understand how we can not require agreement from all acceptors and yet still call our protocol correct: any two majority sets of acceptors will have at least one acceptor in common. Therefore if two proposals are agreed to by a majority, there must be at least one acceptor that agreed to both. This means that when another proposal, for example, is made, a third majority is guaranteed to include either the acceptor that saw both previous proposals or two acceptors that saw one each.
>
>This means that, no matter what stage the protocol is at, there is still enough information available to recover the complete state of all proposals that might affect the execution. Collectively, a majority of acceptors will have complete information and therefore will ensure that only legitimate proposals are accepted.

##### Learner nodes

It is entirely possible for two different acceptors to accept completely different proposals, say because you have competing proposers that interleave their prepare phases and then crash after sending an accept to one node each.

Paxos solves this by having the acceptors not commit the accepted values, instead they broadcast them to the learner nodes. The learner nodes role is to wait until it receives the same value from a majority of acceptors and then commit it. It's this majority that deals with multiple accepted values.

**An important reminder**: in Paxos a node can embody one, some, or all of the three possible roles (proposer, acceptor, learner). So an acceptor might also be a learner.

From "Conditions for learner commit" on [On some subtleties of Paxos](http://the-paper-trail.org/blog/on-some-subtleties-of-paxos/)  
> What this theorem shows is that once a value has been accepted by a majority of acceptors, no proposal can change it. The sequence number might change (consider what happens if a new proposer comes along and runs another proposal over the same instance – the sequence number will increase at some acceptors, but the proposer must choose the majority value for its accept message). But since the majority-accepted value will never change, the learners can commit a value when they hear it from a majority of acceptors.


That page has other good info on the role that learners play. Pay special attention to the "Conditions for learner commit" and "Fault tolerance" sections.



**TODO**: guarantees? how many should we have? can learners become a SPOF? what happens if there is more than one learner node and not all receive the messages from the acceptors? (i.e. inconsistency among learners) what if all acceptors are also learners? what if all proposers are also learners?


##### Walkthrough

![Paxos Prepare Phase](images/paxos_prepare.png)

1. Proposer A sends a **prepare** message with a sequence number (n) of 2 and a value of 8
2. Proposer B sends a **prepare** message with n=4 and a value of 8
3. Acceptor X and Y receives Proposer A's proposal (n=2) first, accepts it, and agrees to not accept any proposals that are older than n=2
4. Acceptor X and Y receives Proposers B's proposal (n=4), accepts it, agrees not to accept any proposals that are older than n=4, and responds with the previously seen proposal (A's)
5. Acceptor Z receives Proposer B's proposal (n=4), accepts it, and agrees to not accept any proposals that are older than n=4
6. Acceptor Z receives Proposer A's proposal (n=2), rejects it, but the reply is lost

![Paxos Accept Phase](images/paxos_accept.png)

1. As A has seen prepare responses from a majority of nodes (it never received Z's response) it can send an accept request. It sends an accept request to every acceptor with the highest seen proposal number (n=2) and value of 8
2. A's request is ignore by the nodes as it's proposal number is not the highest one that it's seen (n=4)
3. B sends an accept request to all nodes with the highest proposal number that it's seen (n=4) and value associated with the highest proposal number among the prepare responses it saw (v=8, note that this is the value that A proposed)
4. B's request is accepted by all the nodes  as it's proposal number is higher or equal to the number that it's already seen
5. As each acceptor accepts the value it sends it to the learner nodes
6. Once a learner node has received a final value from the majority of acceptors then that value is committed. Note that it's possible for a single learner node to receive conflicting values from acceptors, which is why it's important that the learning waits for a **majority** of acceptors to signal the **same** value.

As this point the system has reached consensus on a value of 8 and Paxos is complete.


#### Multi-paxos

**TODO**

#### Cheap Paxos

**TODO**
* https://en.wikipedia.org/wiki/Paxos_(computer_science)#Cheap_Paxos

#### Fast Paxos

**TODO**
* https://en.wikipedia.org/wiki/Paxos_(computer_science)#Fast_Paxos

#### Generalized Paxos

**TODO**
* https://en.wikipedia.org/wiki/Paxos_(computer_science)#Generalized_Paxos


#### More

* <a name="paxos_made_simple" href="http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf">Paxos made simple</a>
* [The part-time parliament](http://research.microsoft.com/en-us/um/people/lamport/pubs/lamport-paxos.pdf)
* [Quorum Systems: With Applications to Storage and Consensus](http://www.amazon.com/Quorum-Systems-Applications-Consensus-Distributed/dp/1608456838/)
* [Consensus Protocols: Paxos](http://the-paper-trail.org/blog/consensus-protocols-paxos/)
* [Consensus Protocols: A Paxos Implementation](http://the-paper-trail.org/blog/consensus-protocols-a-paxos-implementation/)
* [On some subtleties of Paxos](http://the-paper-trail.org/blog/on-some-subtleties-of-paxos/)
* [Paxos Made Live](http://blog.acolyer.org/2015/03/05/paxos-made-live/) - this is an overview of the paper
* [Paxos Made Live - An Engineering Perspective](http://static.googleusercontent.com/media/research.google.com/en//archive/paxos_made_live.pdf)
* [Paxos by example](https://angus.nyc/2012/paxos-by-example/)

### <a name="raft">Raft</a>



* http://raftconsensus.github.io/
* http://the-paper-trail.org/blog/on-raft-briefly/
* [Raft Refloated: Do we have consensus?](http://blog.acolyer.org/2015/03/13/raft-refloated-do-we-have-consensus/) - this is an overview of the paper
* [Raft Refloated: Do We Have Consensus?](http://www.cl.cam.ac.uk/~ms705/pub/papers/2015-osr-raft.pdf)
* http://thesecretlivesofdata.com/
* Talk on Rust, Raft, and Distributed Systems: [Video](https://air.mozilla.org/bay-area-rust-meetup-august-2015/), and [Slides](https://raft.github.io/slides/rustdiego2015.pdf)
* [Consensus: Bridging Theory and Practice](https://github.com/ongardie/dissertation) - Diego Ongaro's PhD dissertation


### <a name="zab">ZAB</a>


* [Zookeeper Atomic Broadcast](http://web.stanford.edu/class/cs347/reading/zab.pdf)
* [Zab: High-performance broadcast for primary-backup systems](http://blog.acolyer.org/2015/03/09/zab-high-performance-broadcast-for-primary-backup-systems/)
* [ZooKeeper’s Atomic Broadcast Protocol: Theory and Practice](http://blog.acolyer.org/2015/03/10/zookeepers-atomic-broadcast-protocol-theory-and-practice/)


### <a name='generating_sequence_numbers'>Generating Sequence Numbers</a>

From [Consensus Protocols: Paxos](http://the-paper-trail.org/blog/consensus-protocols-paxos/)
> How can we ensure that all proposals are uniquely numbered? The easiest way is to have all proposers draw from disjoint sets of sequence numbers. In particular, one practical way is to construct a pair `(sequenceNumber, address)` where the address value is the proposer’s unique network address. These pairs can be totally ordered and at the same time all proposers can ‘outbid’ all others if they choose a sufficiently large sequence number.
>
>The sets are not ranges of numbers but interleaved sets. One example (perhaps a bad one) would be a 64bits padded version of the sequence counter followed by 32bits taken from the ipaddress.
>
>Those numbers won’t collide between proposers on different hosts but it’s easy to pick a higher number for the next proposal by using +1 to the last highest sequence number observed.

**@TODO More specific examples**
