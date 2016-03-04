## Failures in a distributed system

Types of failures:
* Node failure
* Network partition


![Node failure vs network partition](images/system_failures.png)

## Failure modes

![The hierarchy of failure modes](images/hierarchy_of_failure_modes.jpg)


### <a name="fail_stop">Fail-stop (Crash-fail)</a>


### <a name="fail_recover">Fail-recover</a>

### Partitions

### Byzantine

https://en.wikipedia.org/wiki/Byzantine_fault_tolerance
[Byzantine Fault Tolerance, from Theory to Reality](https://www.cs.indiana.edu/classes/p545/post/lec/fault-tolerance/Driscoll-Hall-Sivencrona-Xumsteg-03.pdf)
[The Byzantine Generals Problem](http://www.drdobbs.com/cpp/the-byzantine-generals-problem/206904396)
[The Byzantine Generals Problem](http://research.microsoft.com/en-us/um/people/lamport/pubs/byz.pdf)
[Byzantine Generals in Action: Implementing Fail-Stop Processors](https://www.cs.cornell.edu/fbs/publications/ByzGensInAction.pdf)
[The real Byzantine Generals](https://www.researchgate.net/publication/4122503_The_real_Byzantine_Generals)


## Failure Detection

@TODO

* Further reading from [ Distributed systems for fun and profit](http://book.mixu.net/distsys/time.html)
* http://blog.acolyer.org/2014/11/07/highly-available-transactions-virtues-and-limitations/


### The Phi Accrual Failure Detector

* [The Phi Accrual Failure Detector](www.jaist.ac.jp/~defago/files/pdf/IS_RR_2004_010.pdf)
* Port of Akka's Accrual Failure Detector to [Node.js](www.npmjs.com/package/phi-accrual-detector)
* [Cassandra and its Accrual Failure Detector](http://ljungblad.nu/post/44006928392/cassandra-and-its-accrual-failure-detector)

### Using Gossip

* [Using Gossip Protocols for Failure Detection, Monitoring, Messaging and Other Good Things](http://highscalability.com/blog/2011/11/14/using-gossip-protocols-for-failure-detection-monitoring-mess.html)
