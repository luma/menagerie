# CRDTs




## Replication is hard

Getting N amount of nodes, or people, to agree is hard. Even if the nodes are inclined to agree and act in good faith they can still crash, have their messages delayed, or be unable to even see each other. 

* Replication data between multiple nodes is hard
* There is no free lunch, you have to choose what you care about more
* Fundementally we are looking 

* trade offs of consistency guarantess Strong -> Eventual
* How time (wrt frequency/etc) is frequently the limiting factor 


## What are CRDTs?


1. [Achieving Convergence, Causality-Preservation, and Intention-Preservation in Real-Time Cooperative Editing Systems](http://diyhpl.us/%7Ebryan/papers2/distributed/distributed-systems/real-time-cooperative-editing-systems.1998.pdf), Sun et. al. 1998
2. [A Comprehensive Study of Convergent and Commutative Replicated Data Types](http://hal.upmc.fr/inria-00555588/document), Shapiro et. al. 2011
3. [Strong Eventual Consistency and Conflict-free Replicated Data Types](https://www.microsoft.com/en-us/research/video/strong-eventual-consistency-and-conflict-free-replicated-data-types/?from=http%3A%2F%2Fresearch.microsoft.com%2Fapps%2Fvideo%2Fdl.aspx%3Fid%3D153540), video by Marc Shapiro
4. [CRDT Notes](https://github.com/pfrazee/crdt_notes), by pfrazee. These summarise stuff from the other references.
5. [The bluffers guide to CRDTs in Riak](https://gist.github.com/russelldb/f92f44bdfb619e089a4d)
6. [Key-CRDT Stores](https://run.unl.pt/bitstream/10362/7802/1/Sousa_2012.pdf), design and implementation of SwiftCloud, a Key-CRDT
store that extends a Key-Value store by incorporating CRDTs in the system’s data-mode
7. [Overview of 'A comprehensive study of Convergent and Commutative Replicated Data Types'](https://blog.acolyer.org/2015/03/18/a-comprehensive-study-of-convergent-and-commutative-replicated-data-types/), from [The Morning Paper](https://blog.acolyer.org)
8. [Overview of 'Delta State Replicated Data Types'](https://blog.acolyer.org/2016/04/25/delta-state-replicated-data-types/) from [https://blog.acolyer.org](The Morning Paper)
9. [Eventually Consistent Data Structures](https://www.slideshare.net/seancribbs/eventually-consistent-data-structures-from-strangeloop12/), from strangeloop12 by Sean Cribbs
10. [Dotted Version Vector Sets](https://github.com/ricardobcl/Dotted-Version-Vectors)


## State-based CRDTs

* https://blog.acolyer.org/2015/03/18/a-comprehensive-study-of-convergent-and-commutative-replicated-data-types/

## Operation-based CRDTs

* https://blog.acolyer.org/2015/03/18/a-comprehensive-study-of-convergent-and-commutative-replicated-data-types/

## Delta state CRDTs

* https://blog.acolyer.org/2016/04/25/delta-state-replicated-data-types/
* https://arxiv.org/pdf/1603.01529.pdf

## Counters


### G-Counter

A Grow-Only counter. It can increment, but not decrement. the merge operation takes the maximum value from every replica. It cannot represent negative values.

Operations:
* **Incr()** Increment the counter by 1
* **IncrBy(N)** Increment the counter by N

### PN-Counter

A Positive-Negative counter can both increase and decrease. The merge operation will cause the counter to converge
to the correct final value. This counter can represent negative numbers

Operations:
* **Incr()** Increment the counter by 1
* **IncrBy(N)** Increment the counter by N
* **Decr()** Decrement the counter by 1
* **DecrBy(N)** Decrement the counter by N


## Sets

### G-Set

A Grow-Only set can add values, but not remove them. Once an element is in the set it's there for good.

Operations:
* **Add(VALUE)** Add VALUE to the set
* **Contains(VALUE)** Indicates whether VALUE is in the set
* **Cardinality() int** Returns the set element count
* **Values() []string** Returns the elements in the set as an array of strings

### 2P-Set

A Two-Phase set consists of two G-Sets; one to track additions and another for removals.

Operations:
* **Add(VALUE)** Add VALUE to the set
* **Remove(VALUE)** Remove VALUE from the set
* **Contains(VALUE)** Indicates whether VALUE is in the set
* **Cardinality() int** Returns the set element count
* **Values() []string** Returns the elements in the set as an array of strings

Removed values can never be re-added to a 2P-Set. For example:

``` go
set := rapport.CreateTwoPhaseSet()
set.Add("Foo")
set.Contains("Foo")   // true
set.Remove("Foo")
set.Contains("Foo")   // false
set.Add("Foo")
set.Contains("Foo")   // still false
```


### LWW-e-Set

A Last-Write-Wins element set keeps track of additions and removals, and the relative order of both by using timestamps attached to each value. Each timestamp must be unique and the ordering can be unstable if there's too much disagreement between each replicas clock.

Operations:
* **Add(VALUE)** Add VALUE to the set
* **Remove(VALUE)** Remove VALUE from the set
* **Contains(VALUE)** Indicates whether VALUE is in the set
* **Cardinality() int** Returns the set element count
* **Values() []string** Returns the elements in the set as an array of strings

### OR-Set

Like the LWW-e-Set, a Observed-Removed set tracks additions and removals. Rather than using a timestamp the OR-set tracks the set of added and removed values, or rather unique ids that stand in for values. A value is in the set if a value if the deleted set does not contain all the unique ids for value that are in the added set.

Operations:
* **Add(VALUE)** Add VALUE to the set
* **Remove(VALUE)** Remove VALUE from the set
* **Contains(VALUE)** Indicates whether VALUE is in the set
* **Cardinality() int** Returns the set element count
* **Values() []string** Returns the elements in the set as an array of strings

### AW-Set (AKA ORSWOT)

A Add-Wins set, aka an OR-Set Without Tombstones, was first implemented in Riak (afaik). It's the first of the listed sets that is generally useful. It has less overhead and produces less garbage than a OR-Set.

* **Add(VALUE)** Add VALUE to the set
* **Remove(VALUE)** Remove VALUE from the set
* **Contains(VALUE)** Indicates whether VALUE is in the set
* **Cardinality() int** Returns the set element count
* **Values() []string** Returns the elements in the set as an array of strings


### Big Sets

https://syncfree.lip6.fr/index.php/2-uncategorised/53-big-sets

## Registers

If you imagine a dictionary of key/value pairs then a register is the slot that the key names and that the value goes into.


### LWW-Register

Last-Writer-Wins Register uses a timestamp to decide which replica values are newest during merge operations.

Note that timestamp might actually be a logical time of some sort. If it isn't a logical time then it will suffer from the usual problems of time in a distributed system.


## Flags

## Sequences

### Logoot

https://hal.archives-ouvertes.fr/inria-00432368/document

### LSeq

http://hal.univ-nantes.fr/file/index/docid/921633/filename/fp025-nedelec.pdf

### KSeq

https://github.com/nkohari/kseq/blob/master/README.md

## Maps

### AW-Map

A Add-Wins Map

## Graphs


## Unorganised links

* https://christophermeiklejohn.com/crdt/2014/07/22/readings-in-crdts.html
* https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
* https://news.ycombinator.com/item?id=7732696
* https://developers.soundcloud.com/blog/roshi-a-crdt-system-for-timestamped-events
* https://github.com/aphyr/meangirls#lww-element-set
* https://github.com/soundcloud/roshi
* Reading and read repair from https://github.com/soundcloud/roshi/tree/master/farm and https://en.wikipedia.org/wiki/Symmetric_difference
* [Delta State Replicated Data Types](https://blog.acolyer.org/2016/04/25/delta-state-replicated-data-types/)
* [A Comprehensive study of Convergent and Commutative Replicated Data Types](https://blog.acolyer.org/2015/03/18/a-comprehensive-study-of-convergent-and-commutative-replicated-data-types/)
* [Lasp: A language for distributed, coordination-free programming](https://blog.acolyer.org/2015/08/17/lasp-a-language-for-distributed-coordination-free-programming/)
* [Derflow: Distributed Deterministic Dataflow programming for Erlang](https://blog.acolyer.org/2014/12/19/derflow-distributed-deterministic-dataflow-programming-for-erlang/)
* "Collaborative offline web applications using conflict-free replicated data types"
* [On The Composability of the Riak DT Map: Expanding From Embedded To Multi-Key Structures](https://speakerdeck.com/cmeiklejohn/on-the-composability-of-the-riak-dt-map-expanding-from-embedded-to-multi-key-structures)
* [Incremental  Stream  Processing  using
Computational  Conflict-free  Replicated  Data  Types](http://asc.di.fct.unl.pt/~nmp/pubs/clouddp-2013.pdf)
