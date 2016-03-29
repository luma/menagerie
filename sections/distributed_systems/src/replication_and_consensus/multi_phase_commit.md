# Consensus: multi-phase commit

## 2-phase-commit

2-phase-commit (2PC) is the simplest multi-phase commit protocol.

2PC could be simplified to:

1. The coordinator node contacts every other node, suggests a value, and gathers their responses (`proposal` phase, `commit-request` phase, or `voting` phase)
2. The coordinator nodes all nodes again. If all the nodes agreed then the coordinator tells the nodes to `commit`, otherwise tell the nodes `abort` (`commit-or-abort` phase)

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

If the coordinator is in the `proposal` phase and crashes after sending proposals to some of the cohorts then those cohorts will be blocked until the coordinator recovers.

If the coordinator is in the `commit$-or-$abort` phase and crashes then every cohort will stall until they receive either a commit or a rollback.

In both of these scenarios the coordinator remaining down could mean that the system can't begin another round of 2PC.

Coordinator failure can be mitigated by promoting one of the participants and having them complete the round if the coordinator becomes unresponsive. This does require each participant holding more state about the 2PC execution until the round has either committed or aborted.

2PC is also very latency-sensitive as it can only proceed at the speed of the slowest node.


* [Consensus Protocols: Two-Phase Commit](http://the-paper-trail.org/blog/consensus-protocols-two-phase-commit/)
* [Two-phase_commit_protocol](https://en.wikipedia.org/wiki/Two-phase_commit_protocol) on Wikipedia


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
