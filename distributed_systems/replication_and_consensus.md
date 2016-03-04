# Replication and Consensus

Replication is a group communication problem and most discussions about replication are about the various tradeoffs that can be chosen wrt performance and availability.

## Synchronous

Aka: active, or eager, or push, or pessimistic replication

In the image below you can see the Request phase (Client -> S1), the synchronous phase (S1 synchronously replicates it's state to the other clients), then the Response phase (S1 -> Client).

![Synchronous replication](images/replication-sync.png)

This is a write N-of-N approach in that all writes to all nodes must be acknowledged before the client is notified of success. This limits the performance of writes to that of the slowest node. It is also susceptible to network latency that occurs during the synchronous replication phase.

This approach does give very strong consistency guarantees as every write goes to all nodes. Also a failure to replicate a write to any of the nodes constitutes a failure of the entire Write, so there's no need to deal with out of sync nodes. Finally, because each node contains a copy of the data the system can afford to lose N-1 nodes and still not suffer data loss.



## Asynchronous

Aka: passive replication, or pull replication, or lazy replication

In this example, the client sends the Write to the master (leader/coordinator) which immediately sends a response back to the client ASAP rather than waiting on any synchronous communication with other nodes. It may not have even written the data locally before replying to the client.

Some time later the master propagates the changes to the other nodes.

![Asynchronous replication](images/replication-async.png)

This is a write 1-of-N approach.

This approach is responsive as it immediately replies to the client. It's also more tolerant of network latency as any internal delays wouldn't delay the client response.

It only offers a weak, or probabilistic guarantee of durability. If nothing goes wrong all N nodes will eventually have the data. However, one or more of the nodes may fail during replication and become inconsistent. Additionally, the master node may lose the entire write if it fails before replication begins.

A system using this approach would be available if at least 1-of-N nodes is live.

From the [Replication](http://book.mixu.net/distsys/replication.html) section of Distributed Systems for fun and profit:
> Finally, it's worth noting that passive replication cannot ensure that all nodes in the system always contain the same state. If you accept writes at multiple locations and do not require that those nodes synchronously agree, then you will run the risk of divergence: reads may return different results from different locations (particularly after nodes fail and recover), and global constraints (which require communicating with everyone) cannot be enforced.

## Replication divergence

You can group replication approaches by whether they allow divergence:
* Replication methods that prevent divergence (single copy systems)
* Replication methods that risk divergence (multi-master systems)

The former behave like a single node system and ensures that every node has the same view of the data (consensus). This usually costs more in performance (latency, etc) and availability but is easier to reason about.

The latter does not hide the fact that it's a distributed system. The system will be more responsive, but sometimes nodes will have out of date (due to slow or probabilistic replication) or conflicting (due to concurrent writes at different nodes) data.


## Consensus

Definition:
> Consensus is the problem of having a set of processes agree on a value proposed by one of those processes

All consensus methods must fulfill the following properties:
* **Agreement**: all nodes in $N$ decide on the same value (safety property).
* **Termination**: all non-faulty nodes eventually reach a decision (liveness property)
* **Validity**: if all non-faulty processes device $v$, then $v$ must have been proposed by some node in $N$ (non-triviality property).
* **Integrity**: every node in $N$ decides at most one value $v$, and $v$ is the "right" value (safety property)


* http://bravenewgeek.com/understanding-consensus/
* [Reaching Agreement in the Presence of Faults](http://research.microsoft.com/en-us/um/people/lamport/pubs/reaching.pdf)

### Two generals

From https://en.wikipedia.org/wiki/Two_Generals_Problem:
> Two armies, each led by a general, are preparing to attack a fortified city. The armies are encamped near the city, each on its own hill. A valley separates the two hills, and the only way for the two generals to communicate is by sending messengers through the valley. Unfortunately, the valley is occupied by the city's defenders and there's a chance that any given messenger sent through the valley will be captured.
>
> While the two generals have agreed that they will attack, they haven't agreed upon a time for attack. It is required that the two generals have their armies attack the city at the same time in order to succeed, else the lone attacker army will die trying.
>
> They must thus communicate with each other to decide on a time to attack and to agree to attack at that time, and each general must know that the other general knows that they have agreed to the attack plan. Because acknowledgement of message receipt can be lost as easily as the original message, a potentially infinite series of messages are required to come to consensus.

It's interesting to consider how the generals could agree on a time to attack (i.e. come to consensus).

If one general would be considered the leader then they could send a message to the other general with the time that they wish to attack.

Once sent the leader has no idea whether the second general has received it. If they assume that the second general has received it and attacks then they risk being the sole attacker.

The second general may send a messenger with an acknowledgement back to the leader, but that messenger may be captured and the acknowledgement lost. The second general can't know whether the messenger got through or not. Again, if they assume success and attack they risk being wiped out.

The leader could send an acknowledgement of the second generals acknowledgement. But this could also be lost. The pattern of sending messages and awaiting acknowledgements could continue forever knowing for certain that the messages got through.

* [Proof of the Two Generals problem](https://en.wikipedia.org/wiki/Two_Generals%27_Problem#Proof)


### Byzantine generals

Some definitions:

**Byzantine fault** Any fault presenting different symptoms to different observers

**Byzantine failure** The loss of a system service due to a Byzantine fault in systems that require consensus


From [en.wikipedia.org/wiki/Byzantine_fault_tolerance](https://en.wikipedia.org/wiki/Byzantine_fault_tolerance):
> Byzantine refers to the Byzantine Generals' Problem, an agreement problem (described by Leslie Lamport, Robert Shostak and Marshall Pease in their 1982 paper, "The Byzantine Generals Problem")[1] in which a group of generals, each commanding a portion of the Byzantine army, encircle a city. These generals wish to formulate a plan for attacking the city. In its simplest form, the generals must only decide whether to attack or retreat. Some generals may prefer to attack, while others prefer to retreat. The important thing is that every general agrees on a common decision, for a halfhearted attack by a few generals would become a rout and be worse than a coordinated attack or a coordinated retreat.
>
>The problem is complicated by the presence of traitorous generals who may not only cast a vote for a suboptimal strategy, they may do so selectively. For instance, if nine generals are voting, four of whom support attacking while four others are in favor of retreat, the ninth general may send a vote of retreat to those generals in favor of retreat, and a vote of attack to the rest. Those who received a retreat vote from the ninth general will retreat, while the rest will attack (which may not go well for the attackers). The problem is complicated further by the generals being physically separated and must send their votes via messengers who may fail to deliver votes or may forge false votes.
>
> Byzantine fault tolerance can be achieved if the loyal (non-faulty) generals have a unanimous agreement on their strategy. Note that there can be a default vote value given to missing messages. For example, missing messages can be given the value <Null>. Further, if the agreement is that the <Null> votes are in the majority, a pre-assigned default strategy can be used (e.g., retreat).


* [Byzantine fault tolerance](https://en.wikipedia.org/wiki/Byzantine_fault_tolerance)
* [The Byzantine Generals Problem](http://research.microsoft.com/en-us/um/people/lamport/pubs/byz.pdf)

### <a name='flp_impossibility'>FLP impossibility result</a>

Definition: Distributed **consensus** (1) is **impossible** (2) when at **least one process might fail** (3)

1. Which fulfills the properties of Termination, Validity, Integrity, and Agreement
2. No algorithm solves consensus in every case
3. Specifically Crash failures from the [Hierarchy of Failure Modes](failure.md)

It's an important result as it places an upper bound on what is possible in a asynchronous system.

Some constraints/assumptions that the theorem makes:
* Message deliveries are the only way that nodes may communicate
* Messages are delivered in any order
* But are never lost (c.f. crash model vs. omission model), and are always delivered exactly once
* Nodes do not have access to a shared clock, so cannot mutually estimate the passage of time
* Messages are the only way that nodes may coordinate with each other

**@TODO: Summary of the consequences and a little more about the constraints/assumptions that the theorem makes**


A walkthrough of the proof: [A Brief Tour of FLP Impossibility](http://the-paper-trail.org/blog/a-brief-tour-of-flp-impossibility/)



* http://www.slideshare.net/HenryRobinson/pwl-nonotes
* [Impossibility of Distributed Consensus with One Faulty Process](http://cs-www.cs.yale.edu/homes/arvind/cs425/doc/fischer.pdf)
* [There is No Now: Problems with simultaneity in distributed systems](queue.acm.org/detail.cfm?id=2745385)
* [Chapter 1 Stumbling over consensus research: Misunderstandings and issue](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.174.8238&rep=rep1&type=pdf)


## Strong vs eventual consistency with consensus

## Master-slave replication

Aka: Primary/backup replication, primary copy replication, or log shipping

This can be done in synchronous and asynchronous variants. Synchronous would block on an acknowledgement back to the client, async version does not.

Many DBMSs use this method (MySQL, MongoDB).

As asynchronous replication can only provide weak durability guarantees. You would expect the replication to lag behind the initial write and you could still lose the write if the primary went down before replication began.

The synchronous variant also only provides weak durability. E.g.

1. Client -> Master: here's a change
2. Master -> Each Slaves: replicate this change
3. Each Slaves -> Master: Acks the replication
4. *Master crashes and never acks the client*

The client assumes the write has failed, even through it actually made it into the slaves. If one of the slaves gets promoted to master then it will be incorrect (from the clients perspective).

Event with failover handling the primary is still a single point of failure, and it's impossible that the primary will never fail. The kind of errors that can occur when using Master-slave are:

* lost updates
* incorrect updates
* split-brain: i.e. where a backup to promoted to master (due to a network partition) when the master is still active

Other methods (like 2-phase-commit) add extra rounds of messaging to strengthen their consistency guarantees.


## 2-phase-commit

2-phase-commit (2PC) is the simplest multi-phase commit protocol.

2PC could be simplified to:

1. The coordinator node contacts every other node, suggests a value, and gathers their responses ($proposal$ phase, $commit-request$ phase, or $voting$ phase)
2. The coordinator nodes all nodes again. If all the nodes agreed then the coordinator tells the nodes to $commit$, otherwise tell the nodes $abort$ ($commit$-$or$-$abort$ phase)

The coordinator doesn't need to be elected, any node can kick off a round of 2PC.


    Coordinator                                         Cohort
                            QUERY TO COMMIT
                -------------------------------->
                            VOTE YES/NO             prepare*/abort*
                <-------------------------------
                            COMMIT/ROLLBACK         commit*/abort*
                -------------------------------->
                            ACKNOWLEDGMENT          commit*/abort*
                <--------------------------------  
    end
An * next to the record type means that the record is forced to stable storage.

2PC is quite efficient as it only needs to exchange 3n messages for n nodes.

### Limitations

#### Coordinator failure

2PC is a CA protocol so it does not tolerate network partitions. It's also a blocking protocol. If the coordinator fails permanently then some of the cohorts may not complete their transactions as they will be waiting on the coordinator to take some action.

If the coordinator is in the $proposal$ phase and crashes after sending proposals to some of the cohorts then those cohorts will be blocked until the coordinator recovers.

If the coordinator is in the $commit$-$or$-$abort$ phase and crashes then every cohort will stall until they receive either a commit or a rollback.

In both of these scenarios the coordinator remaining down could mean that the system can't begin another round of 2PC.

Coordinator failure can be mitigated by promoting one of the participants and having them complete the round if the coordinator becomes unresponsive. This does require each participant holding more state about the 2PC execution until the round has either committed or aborted.

2PC is also very latency-sensitive as it can only proceed at the speed of the slowest node.


* [Consensus Protocols: Two-Phase Commit](http://the-paper-trail.org/blog/consensus-protocols-two-phase-commit/)
* https://en.wikipedia.org/wiki/Two-phase_commit_protocol


## 3-phase-commit

Unlike 2PC, 3PC does not execute a transaction in the proposal phase, instead this happens in the prepare phase.

The role of each phase is as follows:

1. **proposal phase**: Do you agree on this state/value?
2. **prepare phase**: are you prepared to commit?
3. **commit phase**: have you committed?

In each phase the coordinator is asking each of the cohorts a question and waiting for them to acknowledge. If the coordinator times out while waiting for cohorts to reply in phases 1 or 2 then it will cancel the transaction.

If the cohorts have completed the prepare phase but never receive a commit message then they will commit anyway. This solves some of the deadlocking problems that 2PC has.

![A successful round of 3-phase-commit](images/Three-phase_commit_diagram.png)

### Disadvantages

3PC is also very latency-sensitive as it can only proceed at the speed of the slowest node.

3PC is not resistant to network partitions as it assumes a Fail-stop model where node failures are always due to crashes and can always be detected. There are approaches that can deal with this ([E3PC](http://webee.technion.ac.il/~idish/Abstracts/jcss.html)).

To highlight the problem, consider this <a name='3pc_network_partition'>scenario</a>:

1. A group of nodes is performing a round of 3PC
2. The coordinator becomes unavailable before all the **prepared-to-commit** messages are received
3. One of the other cohorts gets promoted to coordinator and attempts to complete the run
4. It notices that they are all ready to commit (because they had sent **prepared-to-commit**) and tells them to commit
5. Meanwhile the original coordinator becomes available again (it was Fail-recover rather than Fail-stop), realises that it hasn't received the **prepared-to-commit** messages and sends an abort message
6. The **commit** and **abort** messages from both coordinators end up being interleaved and some cohorts attempt to abort and some to commit. Chaos ensues and state inconsistencies abound...

Incidentally, this also highlights why [Fail-recover](./failure.md#fail_recover) is harder to deal with than [Fail-stop](./failure.md#fail_stop).


* [Consensus Protocols: Three-phase Commit](http://the-paper-trail.org/blog/consensus-protocols-three-phase-commit/)
* [Three-phase commit protocol](https://en.wikipedia.org/wiki/Three-phase_commit_protocol)

## State Replication

Master-slave and multi-phase commit (2PC+3PC) will all fail under network partitions. Paxos, Raft, and ZAB use a state replication based approach that *is* partition tolerant and are widely used.

State Replication for consensus is basically Master-slave using leaders (coordinator), quorums, and replicas of operation logs (either as the full logs or deltas).

Like multi-phase commit a leader is chosen that will handle all changes and then broadcast them to the rest of the group. Each node in the group keeps it's own replica of the logs.

### Quorums: consensus by majority

Rather than requiring all participants to reply before committing these approaches only require a majority (quorum) to acknowledge. This means that systems using this approach will not deadlock if the minority of nodes becomes unavailable.

From http://book.mixu.net/distsys/replication.html
> Partition tolerant consensus algorithms use an odd number of nodes (e.g. 3, 5 or 7). With just two nodes, it is not possible to have a clear majority after a failure. For example, if the number of nodes is three, then the system is resilient to one node failure; with five nodes the system is resilient to two node failures.

In fact, even if the system was partitioned into several smaller systems the largest system (the majority) was still be able to function. The minority nodes would have to stop accepting writes to avoid diverging but would be able to rejoin the quorum if the partition heals.

### Sacrificing availability (liveness) for consistency

From http://the-paper-trail.org/blog/consensus-protocols-paxos/
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

Different papers tend to use different terminology for the same concepts. Below is a mapping of the core Paxos terms to the ones from the previous sections.

* **Proposer**: the coordinator or master
* **Acceptors**: the cohorts in multi-phase speak

#### Protocol

The core of Paxos is actually rather similar to 2-phase-commit. At a high level it looks like:

1. proposer (coordinator) sends a proposal to all of the acceptors
2. once the acceptors have agreed on the proposal the proposer sends a commit request to the acceptors
3. each acceptor commits the value and informs the proposer
4. once enough acceptors have advised the proposer that the value is committed the protocol terminates

Paxos differs from 2PC in when a acceptor may accept a proposal and what value the proposer is allowed to eventually request for acceptance.

Another difference is that in Paxos there may be multiple proposers suggesting values at the same time. The protocol deals with this although it can be worth limiting the number of possible proposers (if possible) as too many can increase the time it takes to reach consensus.

##### Determining ordering of proposals

One of the issues that multi-phase commit has is that cohorts being promoted when the coordinator is Fail-recover can cause split-brain and inconsistent state within the system (See an [example of this](#3pc_network_partition)). Paxos eliminates these types of issues by establishing a total order among proposals by tagging them with sequence numbers.

This allows acceptors and proposers to order proposals and know which are the newest. Acceptors can reject messages from old coordinators and them from disrupting consensus once it's achieved.

Coordinators must keep track of the most recent sequence numbers, they can then assign new proposals a unique sequence number that is higher that any previous ones that it knows. When it's ready to propose a value it can create a **propose** message with that sequence number.

When a proposal arrives, the acceptor checks to see if the proposals sequence number is newer (higher) than any that it's previously seen. If it is then the acceptor returns a promise to the proposer that guarantees that it won't accept any proposals that are older than the new proposal. If the new proposal number is older then the accept will reject the proposal and return the sequence number of the current proposal.

An important point about this system is that it allows the acceptors to agree on proposals **without** any extra communication. This helps with the consequences of us assuming an asynchronous system (see the [FLP Impossibility result](#flp_impossibility)).

**TODO**: write a bit on how to generate/choose sequence numbers


##### Majorities

From Majorities in [Consensus Protocols: Paxos](http://the-paper-trail.org/blog/consensus-protocols-paxos/):
>One simple fact helps us understand how we can not require agreement from all acceptors and yet still call our protocol correct: any two majority sets of acceptors will have at least one acceptor in common. Therefore if two proposals are agreed to by a majority, there must be at least one acceptor that agreed to both. This means that when another proposal, for example, is made, a third majority is guaranteed to include either the acceptor that saw both previous proposals or two acceptors that saw one each.
>
>This means that, no matter what stage the protocol is at, there is still enough information available to recover the complete state of all proposals that might affect the execution. Collectively, a majority of acceptors will have complete information and therefore will ensure that only legitimate proposals are accepted.

##### Learner nodes




#### Multi-paxos



#### Cheap Paxos

* https://en.wikipedia.org/wiki/Paxos_(computer_science)#Cheap_Paxos

#### Fast Paxos

* https://en.wikipedia.org/wiki/Paxos_(computer_science)#Fast_Paxos

#### Generalized Paxos

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

### <a name="zab">ZAB></a>


* [Zookeeper Atomic Broadcast](http://web.stanford.edu/class/cs347/reading/zab.pdf)
* [Zab: High-performance broadcast for primary-backup systems](http://blog.acolyer.org/2015/03/09/zab-high-performance-broadcast-for-primary-backup-systems/)
* [ZooKeeper’s Atomic Broadcast Protocol: Theory and Practice](http://blog.acolyer.org/2015/03/10/zookeepers-atomic-broadcast-protocol-theory-and-practice/)


## Gossip Protocols

* https://en.wikipedia.org/wiki/Gossip_protocol
* Anti-entropy protocols?
* http://highscalability.com/blog/2011/11/14/using-gossip-protocols-for-failure-detection-monitoring-mess.html
* http://videlalvaro.github.io/2015/12/gossip-protocols.html
* https://greta.io/documentation/gossip
* http://blog.dshr.org/2014/11/gossip-protocols-clarification.html



### Epidemic Broadcast Trees

* http://homepages.gsd.inesc-id.pt/~jleitao/pdf/srds07-leitao.pdf
* https://github.com/helium/plumtree
* [Controlled Epidemics: Riak's New Gossip Protocol and Metadata Store (Jordan West) - RICON West 2013](https://www.youtube.com/watch?v=s4cCUTPU8GI)

## CALM: consistency as logical monotonicity


* http://bloom-lang.net/calm/
* [Consistency Analysis in Bloom: a CALM and Collected
Approach](http://db.cs.berkeley.edu/jmh/calm-cidr-short.pdf)
* [The CALM Conjecture: Reasoning about Consistency](https://databeta.wordpress.com/2010/10/28/the-calm-conjecture-reasoning-about-consistency/)

## Summary

From the [Replication](http://book.mixu.net/distsys/replication.html) section of Distributed Systems for fun and profit:
![Aspects of different replication optios](images/google-transact09.png)


**@TODO: Add some commentary**

## More

* [Fault-Tolerant Real-Time Systems: The Problem of Replica Determinism](http://www.amazon.com/Fault-Tolerant-Real-Time-Systems-Determinism-International/dp/079239657X)
* [Responsive Computer Systems: Steps Toward Fault-Tolerant Real-Time Systems](http://www.amazon.com/Responsive-Computer-Systems-Fault-Tolerant-International/dp/0792395638)
* [Real-Time Systems: Design Principles for Distributed Embedded Applications](http://www.amazon.com/Real-Time-Systems-Principles-Distributed-Applications-ebook/dp/B00F5U6C8O/)
* [Fault-tolerant Agreement in Synchronous Message-passing Systems](http://www.amazon.com/Fault-tolerant-Agreement-Synchronous-Message-passing-Distributed/dp/1608455254/)
* [Stumbling over Consensus Research: Misunderstandings and Issues](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.174.8238&rep=rep1&type=pdf)
* [Understanding Replication in Databases and Distributed Systems](http://www-users.cselabs.umn.edu/classes/Spring-2014/csci8980-sds/Papers/ProcessReplication/Understanding-Replication-icdcs2000.pdf)
