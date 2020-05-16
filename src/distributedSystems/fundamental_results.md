# Fundamental results

> Some facts just need to be internalised. There are more than this, naturally, but here’s a flavour:
>
> * You can’t implement consistent storage and respond to all requests if you might drop messages between processes. This is the [CAP theorem](consistency_availability_and_partition_tolerence.md).
> * Consensus is impossible to implement in such a way that it both a) is always correct and b) always terminates if even one machine might fail in an asynchronous system with crash-* stop failures (the FLP result). The first slides – before the proof gets going – of my [Papers We Love SF talk](http://www.slideshare.net/HenryRobinson/pwl-nonotes) do a reasonable job of explaining the result, I hope. Suggestion: there’s no real need to understand the proof.
> * Consensus is impossible to solve in fewer than 2 rounds of messages in general

Quote from [Distributed systems theory for the distributed systems engineer](http://the-paper-trail.org/blog/distributed-systems-theory-for-the-distributed-systems-engineer/).
