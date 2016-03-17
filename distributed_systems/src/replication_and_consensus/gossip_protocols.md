# Consensus: gossip protocols

Aka: epidemic protocols.

>The concept of gossip communication can be illustrated by the analogy of office workers spreading rumors. Let's say each hour the office workers congregate around the water cooler. Each employee pairs off with another, chosen at random, and shares the latest gossip. At the start of the day, Alice starts a new rumor: she comments to Bob that she believes that Charlie dyes his mustache.
>
>At the next meeting, Bob tells Dave, while Alice repeats the idea to Eve. After each water cooler rendezvous, the number of individuals who have heard the rumor roughly doubles (though this doesn't account for gossiping twice to the same person; perhaps Alice tries to tell the story to Frank, only to find that Frank already heard it from Dave).
>
>The power of gossip lies in the robust spread of information. Even if Dave had trouble understanding Bob, he will probably run into someone else soon and can learn the news that way.

Fundamentally, gossip protocols involve periodically contacting some subset of nodes and exchanging information with them. Gossip does not assume reliable communication and there is implicit redundancy in the replication because multiple nodes may attempt to share the same gossip to a specific node. This makes them nicely fault-tolerant and robust at the cost of extra messaging overhead.

Nodes are classified as infected, susceptible, and removed.
* **infected**: tries to spread new info periodically by exchanges with peers
* **susceptible**: doesn't know about the info that is being spread. So it can be inflected
* **removed**: already knows the info that is being spread around but is not spreading it (i.e. they may have no more peers to exchange with).

If the language used makes it sound almost like a virus being spread then that's because early researchers on Gossip protocols studied how a disease disseminates in a population. This is also why the alternative name for Gossip protocols is Epidemic protocols.


Gossip protocols are actually very common. For example the Internet's routing protocols have gossip like behaviour.

### <a name='which_nodes'>How to choose which nodes to contact</a>

Fundamentally, gossip protocols involve periodically contacting some subset of nodes, either from the total set of nodes, or from the set of neighbours, and exchanging information with them.

### High level overview

* A node \\( A \\) randomly selects a subset \\( N \\) of nodes from a network (See [How to choose which nodes to contact](#which_nodes))
* for each node \\( B \\) in \\( N$
  * \\( A \\) sends some data to \\( B$
  * \\( B \\) replies with data to \\( A$


### Exponentially rapid convergence

A nice property of certain gossip protocols is that they converge towards consensus, or if the goal isn't replication then some equilibrium state, exponentially with a probability of 1.0.


From the [Gossip protocol types](https://en.wikipedia.org/wiki/Gossip_protocol#Gossip_protocol_types):
> The term convergently consistent is sometimes used to describe protocols that achieve exponentially rapid spread of information. For this purpose, a protocol must propagate any new information to all nodes that will be affected by the information within time logarithmic in the size of the system (the "mixing time" must be logarithmic in system size).

**TODO: More on this would be interesting. Relevant papers?**


### For Dissemination

Aka: rumor-mongering protocols.

**TODO**

### For Anti-entropy

Anti-entropy protocols act to repair differences between replicas by comparing and reconciling those differences. Gossip protocols can be used to exchange snapshots from each node and identify differences.

For example: Say that each node replicates a key/value data set and uses a [Merkle tree](merkle_trees.md) to allow differences between keys to be compared efficiently between nodes. Once the set of differing sub-trees is identified then the nodes exchange the differences for reconciliation.


### For computation

**TODO**

### For exploration

**TODO** Geo usecases, large scale graph exploration, etc


### Specific approaches

#### SWIM

**TODO SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol**


#### What Cassandra do...


#### Epidemic Broadcast Trees

These were introduced in the [Epidemic Broadcast Trees](http://homepages.gsd.inesc-id.pt/~jleitao/pdf/srds07-leitao.pdf) paper. The actual protocol is called Plugin, which stands for **push-lazy-push multicast tree**.

There's a full implementation [here](https://github.com/helium/plumtree) which was extracted from [Riak Core](https://github.com/basho/riak_core). For a nice introduction see Jordan West's [RICON West 2013 task](https://www.youtube.com/watch?v=s4cCUTPU8GI) and Joao Leitao & Jordan West's [RICON 2014 talk](https://www.youtube.com/watch?v=bo367a6ZAwM).



### More

* [Gossip_protocol](https://en.wikipedia.org/wiki/Gossip_protocol) on Wikipedia
* [Using Gossip Protocols for Failure Detection, Monitoring, Messaging and Other Good Things](http://highscalability.com/blog/2011/11/14/using-gossip-protocols-for-failure-detection-monitoring-mess.html)
* http://videlalvaro.github.io/2015/12/gossip-protocols.html
* [Bimodal Multicast](https://www.cs.cornell.edu/Courses/cs614/2003SP/papers/BHO99.pdf)
* [Bimodal Multicast over webRTC](https://greta.io/documentation/gossip)
* [Gossip protocols: a clarification](http://blog.dshr.org/2014/11/gossip-protocols-clarification.html)
* A Mavenized Apache V2 [gossip implementation](https://github.com/edwardcapriolo/gossip) for Java
* "The promise, and limitations, of gossip protocols" if you can find a copy
* See the following textbook for information about the mathematical modeling of these protocols: **The Mathematical Theory of Epidemics. N.J.T. Bailey, 1957. Griffen Press.**
