# Distributed Systems Notes

## Fundamental results

> Some facts just need to be internalised. There are more than this, naturally, but here’s a flavour:
>
> * You can’t implement consistent storage and respond to all requests if you might drop messages between processes. This is the [CAP theorem](consistency_availability_and_partition_tolerence.md).
> * Consensus is impossible to implement in such a way that it both a) is always correct and b) always terminates if even one machine might fail in an asynchronous system with crash-* stop failures (the FLP result). The first slides – before the proof gets going – of my [Papers We Love SF talk](http://www.slideshare.net/HenryRobinson/pwl-nonotes) do a reasonable job of explaining the result, I hope. Suggestion: there’s no real need to understand the proof.
> * Consensus is impossible to solve in fewer than 2 rounds of messages in general

Quote from [Distributed systems theory for the distributed systems engineer](http://the-paper-trail.org/blog/distributed-systems-theory-for-the-distributed-systems-engineer/).


## Links to review

* http://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-824-distributed-computer-systems-engineering-spring-2006/index.htm
* http://bravenewgeek.com/from-the-ground-up-reasoning-about-distributed-systems-in-the-real-world/
* https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing
* http://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf
* http://www.enterpriseintegrationpatterns.com/docs/IEEE_Software_Design_2PC.pdf
* http://highscalability.com/blog/2015/10/12/making-the-case-for-building-scalable-stateful-services-in-t.html
* http://www.slideshare.net/TylerTreat/from-mainframe-to-microservice-an-introduction-to-distributed-systems-41004778/23
* http://bravenewgeek.com/distributed-systems-are-a-ux-problem/
* https://christophermeiklejohn.com/distributed/systems/2013/07/12/readings-in-distributed-systems.html
* http://videlalvaro.github.io/2015/12/learning-about-distributed-systems.html
* [Introduction to Reliable and Secure Distributed Programming](http://www.amazon.com/Introduction-Reliable-Secure-Distributed-Programming-ebook/dp/B008R61LBG/)
* [Distributed systems theory for the distributed systems engineer](http://the-paper-trail.org/blog/distributed-systems-theory-for-the-distributed-systems-engineer/)
* [Notes on Distributed Systems for Young Bloods](https://www.somethingsimilar.com/2013/01/14/notes-on-distributed-systems-for-young-bloods/)
* [A Note on Distributed Computing](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.41.7628&rep=rep1&type=pdf)
* [Fallacies of distributed computing](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing)
* [Fallacies of distributed computing explained](http://www.rgoarchitects.com/Files/fallacies.pdf)
* [Designs, Lessons and Advice from Building Large Distributed Systems](http://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf)
* [Readings in Distributed Systems
Systems](http://henryr.github.io/distributed-systems-readings/)

## Contents

* [Consistency, availability, and partition tolerance](consistency_availability_and_partition_tolerence.md)
* [Time, Clocks, and Ordering](time_clocks_and_ordering.md)
* [Consensus](consensus.md)
* [Failure Detection](failure_detection.md)
* [Messaging](messaging.md)
* [Consistent Hashing](consistent_hashing.md)
* [Causality and Optimistic Replication](causality_and_optimistic_replication.md)
* [CRDTs](crdts.md)
