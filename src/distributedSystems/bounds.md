# Bounds

## Upper Bound and Least Upper Bound (LUB)

Simply, the Upper Bound of a non-empty set of numbers is any numbers that is equal or larger than any number in that set.

I.e.
Let \\( S \\) be a non-empty set of real numbers.

Then \\( x \\) is an upper bound for \\( S \\) if \\( x \geq s \space \forall \space s \in S \\)

And \\( y \\) is a least upper bound for \\( S \\) if \\( y \\) is an upper bound and also \\( y \leq all \space x \\)

The least-upper-bound property states that any non-empty set of real numbers that has an upper bound must have a least upper bound in real numbers.

### Questions

Based on the definitions upper bound and least upper bound could be equal?

So of a finite set of real numbers you could construct an infinitely large number of sets of upper bounds. But is the set of least upper bounds only relative to the specific set of number and upper bounds?

E.g.

Let \\( S =\\{ 0, 1, 2, 3 \\} \\)

Then we could construct a (finite) set of upper bounds like \\( A =\\{ 4, 5, 6 \\} \\). We could have also chosen any of the following:
* \\(\\{ 3, 4, 5, 6 \\} \\)
* \\(\\{ 5, 6 \\} \\)
* \\(\\{ 6 \\} \\)

They are all sets of numbers that fulfill the definition of an upper bound.

Based on the first definition of \\( A \\) would the least upper bound be \\(\\{ 3, 4 \\} \\) or \\(\\{ 3 \\} \\)?

Basically, when deciding what are least upper bounds can you consider a subset of possible upper bounds rather than set of all possible ones.

If the former is possible then the various different sets of upper bounds can have different sets of LUBs. If the latter is true then it seems like the LUB will always be \\(\\{ 3 \\}\\) for all of the above examples.
