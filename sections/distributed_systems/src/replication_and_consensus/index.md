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
* **Agreement**: all nodes in \\( N \\) decide on the same value (safety property)
* **Termination**: all non-faulty nodes eventually reach a decision (liveness property)
* **Validity**: if all non-faulty nodes decide \\( v \\), then \\( v \\) must have been proposed by some node in \\( N \\) (non-triviality property)
* **Integrity**: every node in \\( N \\) decides at most one value \\( v \\), and \\( v \\) is the "right" value (safety property)



### Two generals

From https://en.wikipedia.org/wiki/Two_Generals_Problem:
> Two armies, each led by a general, are preparing to attack a fortified city. The armies are encamped near the city, each on its own hill. A valley separates the two hills, and the only way for the two generals to communicate is by sending messengers through the valley. Unfortunately, the valley is occupied by the city's defenders and there's a chance that any given messenger sent through the valley will be captured.
>
> While the two generals have agreed that they will attack, they haven't agreed upon a time for attack. It is required that the two generals have their armies attack the city at the same time in order to succeed, else the lone attacker army will die trying.
>
> They must thus communicate with each other to decide on a time to attack and to agree to attack at that time, and each general must know that the other general knows that they have agreed to the attack plan. Because acknowledgement of message receipt can be lost as easily as the original message, a potentially infinite series of messages are required to come to consensus.

It's interesting to consider how the generals could agree on a time to attack (i.e. come to consensus).

If one general would be considered the leader then they could send a message to the other general with the time that they wish to attack. Once a message is sent the leader has no idea whether the second general has received it. If they assume that the second general has received it and attacks then they risk being the sole attacker.

Once the second general receives the order they may send a messenger back with an acknowledgement to the leader, but that messenger may be captured and the acknowledgement lost. The second general can't know whether the messenger got through or not. Again, if they assume success and attack they risk being wiped out.

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

@TODO
