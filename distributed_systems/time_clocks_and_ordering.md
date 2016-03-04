# Time, clocks, and ordering

> Messages sent between machines may arrive zero or more times at any point after they are sent

This is an unescapable property of distributed systems and also why they are difficult.

Participants in a distributed system that spans networks don't always have clocks that agree. This could be because differing clocks have differing levels of accuracy, or just run at different rates. Consequently participants may not be able to agree on what time an event has occurred.

If participants can't agree on when then they also can't agree on what order.

E.g. Two nodes can exchange messages about events across a network:
```
Node1: event A happened at 09:00:03
Node2: event B happened at 09:00:06
```

If both nodes clocks are accurate and agree then you can say $A \rightarrow B$, or $A$ happened before $B$. If instead Node2's clock was 5sec slow relative to Node1's then $B$ actually actually happened at 09:00:01 from Node1's perspective.

If Node1 could know this then it could account for Node2's clock drift when ordering events. I.e. Node1 could figure out that the correct ordering is $B \rightarrow A$.

## <a name="head_total_and_partial_order">Total and partial order</a>

A total order means that every event can be ordered wrt every other event and is how humans usually think of ordering. This implies that if $a \rightarrow b$ and $b \rightarrow c$ then we can also infer $a \rightarrow c$.

A partial order means that there are at least some events that can have no meaningful order or relationship with each other.

> *Definition* The relation "$\rightarrow$" on the set of events of a system is the smallest relation satisfying the following three conditions:
> 1. If $a$ and $b$ are events in the same process, and $a$ comes before $b$, then $a \rightarrow b$.
> 2. If $a$ is the sending of a message by one process and $b$ is the receipt of the same message by another process, then $a \rightarrow b$.
> 3. If $a \rightarrow b$ and $b \rightarrow c$ then $a \rightarrow c$. Two distinct events $a$ and $b$ are said to be concurrent if $a \not\rightarrow b$ and $b \not\rightarrow a$.
>
> We assume that $a \not\rightarrow a$ for any event $a$. (Systems in which an event can happen before itself do not seem to be physically meaningful.) This implies that $\rightarrow$ is an irreflexive<sup>[1](#footnote_1)</sup> partial ordering on the set of all events in the system.
>
> Another way of viewing the definition is to say that a->b means that it is possible for event a to causally affect event b. Two events are concurrent if neither can causally affect the other.
<sup>[2](#footnote_2)</sup>

Note in #3 that if you have any distinct events then you can only have a partial order. If you never have distinct events then you can have a total order. In a distributed system you will **always** have a partial order.


Both total order and partial order are [transitive](en.wikipedia.org/wiki/Transitive_relation) and [antisymmetric](http://en.wikipedia.org/wiki/Antisymmetric_relation).

if $a ≤ b \land b ≤ a$ then $a = b$ (antisymmetry);<br />
if $a ≤ b \land b ≤ c$ then $a ≤ c$ (transitivity);

However, a total order is [total](http://en.wikipedia.org/wiki/Total_relation):

> a binary relation R over a set X is total or complete if for all a and b in X, a is related to b or b is related to a (or both).

I.e. $a ≤ b \lor b ≤ a \space \forall a, b \in X$

while a partial order is only [reflexive](http://en.wikipedia.org/wiki/Reflexive_relation):

> a reflexive relation is a binary relation on a set for which every element is related to itself. In other words, a relation ~ on a set S is reflexive when x ~ x holds true for every x in S

I.e. $a ≤ a \space \forall a \in X$

Some elements may be comparable to others, but reflexivity guarantees only that you can compare each member with itself. Notice also that totality encapsulates reflexivity; so total order is a stronger version of partial order.


## Realtime (wall) clocks

Don't trust 'em, unless you can afford atomic clocks or have a super low latency and accurate way of dealing with clock drift between nodes.

On most 'nux systems you are probably getting the timestamp via a something backed by `gettimeofday()`, which in turn uses a combination of hardware timers and NTP. This type of clock uses Integers to represent real time via one of the many standards ([UTC](en.wikipedia.org/wiki/Coordinated_Universal_Time), [POSIX time](en.wikipedia.org/wiki/Unix_time), [TAI](en.wikipedia.org/wiki/International_Atomic_Time), [GPS](tycho.usno.navy.mil/gpstt.html))

When using NTP, asymmetric routes and network congestion can cause errors of 100 ms or more.  <sup>[3](#footnote_3)</sup>&#8200;<sup>[4](#footnote_4)</sup>

They can also be fast, slow, or even flow backwards due to various OS and hardware issues:


> * Hardware wonkiness can push clocks days or centuries into the future or past.
> * Virtualization can wreak havoc on kernel timekeeping.
> * Misconfigured nodes may not have NTP enabled, or may not be able to reach upstream sources.
> * Upstream NTP servers can lie.
> * When the problem is identified and fixed, NTP corrects large time differentials by jumping the clock discontinously to the correct time.
> * Even when perfectly synchronized, POSIX time itself is not monotonic.
>
> That last one might come as a surprise, because we usually think of POSIX time as being “the number of seconds since an epoch”. This isn’t quite true. Because Of Reasons, POSIX days are defined as 86400 seconds in length. However, real days aren’t exactly 86400 seconds. The powers-that-be occasionally schedule leap seconds to correct for the drift. On those occasions, the system clock will either skip a second, or double-count a second–e.g., counting 59:60.7, 59:60.8, 59:60.9, 59:60.0, 59:60.1, and then repeating the previous second’s worth of timestamps before continuing on.
>
> There are therefore some POSIX timestamps which do not refer to any time, and there are some POSIX timestamps which refer to two distinct times. This most recently happened on July 1st, 2012, and again a month later. This causes so many problems that Google actually smears out the leap second over the course of the day, preserving monotonicity.<sup>[5](#footnote_5)</sup>

These can cause chaos for consistency handling in any system that uses timestamps from wall calls (i.e. Cassandra). If a system is using a LWW semantic for resolving concurrent writes then the issues quoted above can cause newer updates to be thrown away in favour of older ones.

E.g.
1. Client1 writes W1 to Node1
2. *a leap second occurs*
3. Client 2 writes W2 to Node1

W2 should be newer than W1 but the leap second will cause W1 to have a more recent timestamp and W2 would be thrown away.

Using monotonic non-decreasing clocks can make these problems go away.

I like Aphyr's summary so I'm gonna quote him again:
> Timestamps, as implemented in Riak, Cassandra, et al, are fundamentally unsafe ordering constructs. In order to guarantee consistency you, the user, must ensure locally monotonic and, to some extent, globally monotonic clocks. This is a hard problem, and NTP does not solve it for you. When wall clocks are not properly coupled to the operations in the system, causal constraints can be violated. To ensure safety properties hold all the time, rather than probabilistically, you need logical clocks. <sup>[5](#footnote_5)</sup>


## Logical clocks

A timestamp is basically a symbol that can be used as a marker or counter for a particular state. It measures from some arbitrary start state to some recent moment. It allows us to order events that modify that state.

Instead of using a timestamp from a real clock we can instead measure with logical time by using some kind of monotonic increasing counter.

As this counter has no real relationship with real time so you can't infer anything about the "distance" between one counter value and the next. Additionally, this kind of clock cannot be used for timeouts.

But it can be used to order events and will not suffer any of the issues caused by out of sync wall clocks.

Logical clocks always define a [Partial Order](#head_total_and_partial_order) so ordering events between networks/system requires a counter (logical clock) and a way to exchange messages.


## Lamport clocks

A Lamport Clock is one of the simplest types of logical clocks. It was first introduced by Leslie Lamport in `Time, Clocks, and the Ordering of Events in a Distributed System`.

When using a Lamport Clock is process would maintain a counter using the following rules:
* Whenever a process does work, increment the counter
* Whenever a process sends a message, include the counter
* When a message is received, set the counter to
   max(local_counter, received_counter) + 1

``` rust
use std::cmp;

pub type LamportTime = u64;

#[derive(Debug)]
pub struct LamportClock {
  pub value: LamportTime,
}

impl LamportClock {
  pub fn new() -> LamportClock {
    LamportClock {
      value: 1,
    }
  }

  pub fn increment(&mut self) {
    self.value += 1;
  }

  pub fn merge(&mut self, other: LamportClock) {
    self.value = cmp::max(self.value, other.value) + 1;
  }
}

fn main() {
  let mut time = LamportClock::new();
  println!("First: {:?}", time);
  time.increment();
  println!("Second: {:?}", time);
}
```

Lamport clocks define a [partial order](#head_total_and_partial_order), therefore `clock(a) < clock(b)` implies that either
1. $a$ may have happened before $b$
2. $a$ may be incomparable to $b$

For #2, $a$ and $b$ maybe from different causal histories. Lamport clocks can only model a single history so events from other histories may cause concurrent events to appear ordered when they aren't.

Consider a three node system where nodes 1 and 2 are communicating with each other, as are nodes 1 and 3. As 2 and 3 never actually communicate with each other those two histories (1 <-> 2 and 1 <-> 3) are separate, concurrent, and cannot be meaningfully ordered against each other.


## Vector clocks

Vector clocks are a generalisation of lamport clocks that allow better handling of multiple histories. Rather than having a single value vector clocks maintain a array that contains one counter for each node in the system.

Each clock then updates it own counter, rather than the common one. The rules are:
* Whenever a process does work, increment the logical clock value of the node in the vector
* Whenever a process sends a message, include the full vector of logical clocks
* When a message is received:
- update each element in the vector to be max(local, received)
- increment the logical clock value representing the current node in the vector

``` rust
use uuid::Uuid;
use std::collections::HashMap;
use std::collections::hash_map::Entry::{Occupied, Vacant};

pub type NodeId = Uuid;
pub type NodeValues = HashMap<NodeId, u64>;

#[derive(Debug)]
pub struct VectorClock {
  pub values: NodeValues,
}

impl VectorClock {
  pub fn new() -> VectorClock {
    VectorClock { values: NodeValues::new() }
  }

  pub fn increment(&mut self, node_id: NodeId) {
    *self.values.entry(node_id).or_insert(0) += 1;
  }

  pub fn merge(&mut self, other: &VectorClock) {
    for (node_id, value) in &other.values {
      // Merge the value for node_id into us if we don't know about
      // it or our local value is smaller.

      match self.values.entry(*node_id) {
        Occupied(mut entry) => {
          if entry.get() < value {
            entry.insert(*value)
          }
        }
        Vacant(mut entry) => {
          entry.insert(*value)
        },
      }
    }
  }
}
```


![Three clients concurrently modifying the same key on two replica nodes. Per-server entries](images/vector_clock.png)

Each of the three nodes (A, B, C) keeps track of the vector clock. As events occur, they are timestamped with the current value of the vector clock. Examining a vector clock such as `{ A: 2, B: 4, C: 1 }` lets us accurately identify the messages that (potentially) influenced that event.

The issue with vector clocks is mainly that they require one entry per node, which means that they can potentially become very large for large systems. A variety of techniques have been applied to reduce the size of vector clocks (either by performing periodic garbage collection, or by reducing accuracy by limiting the size).


## Atomic clocks, Spanner, and the TrueTime api

@TODO

* http://research.google.com/archive/spanner.html
* https://www.youtube.com/watch?v=NthK17nbpYs
* https://www.usenix.org/conference/osdi12/technical-sessions/presentation/corbett
* [living without atomic clocks](www.cockroachlabs.com/blog/living-without-atomic-clocks/)





## More

* [scattered-thoughts.net/blog/2012/08/16/causal-ordering/](http://scattered-thoughts.net/blog/2012/08/16/causal-ordering/)
* [Distributed Systems for fun and profit](http://book.mixu.net/distsys/)
* Time, Clocks, and the Ordering of Events in a Distributed System by Leslie Lamport
* Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases
* Technical Report: HybridTime - Accessible Global Consistency with High Clock Uncertainty
* http://blog.acolyer.org/2016/02/15/a-short-note-on-atomicity-and-ordering/

## Notes

1. <a name="footnote_1"></a>*Definition:* "A relation that is irreflexive, or anti-reflexive, is a binary relation on a set where no element is related to itself. An example is the "greater than" relation (x>y) on the real numbers."
2. <a name="footnote_1"></a>Time, Clocks, and the Ordering of Events in a Distributed System
3. <a name="footnote_3" href="http://www.ntp.org/ntpfaq/NTP-s-algo.htm#Q-ACCURATE-CLOCK">NTP FAQ: How accurate will my Clock be?</a>
4. <a name="footnote_4" href="https://www.eecis.udel.edu/~mills/exec.html#precise">Computer Network Time Synchronization: Precision and Accuracy</a>
5. <a name="footnote_5" href="https://aphyr.com/posts/299-the-trouble-with-timestamps">The trouble with timestamps</a>
