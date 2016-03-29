# Master-slave replication

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
* split-brain: i.e. where a backup to promoted to master (due to a network partition) when the master is still active and they work against each other. This leads to inconsistent state amongst the nodes as they get different results depending on which master they listen to

Other methods (like 2-phase-commit) add extra rounds of messaging to strengthen their consistency guarantees.
