# Hashing and Hash Tables


## Pigeonhole Principle

## Perfect hashing

## Minimal perfect hashing


## Cryptographic hash function

As opposed to hashing for lookup
* https://en.wikipedia.org/wiki/Cryptographic_hash_function

## Locality-sensitive hashing

* https://en.wikipedia.org/wiki/Hash_function#Locality-sensitive_hashing
* https://en.wikipedia.org/wiki/Locality-sensitive_hashing

### Hyperspace hashing

@TODO How does this fit in?


## Evaluating different hash functions

## Testing hash functions

## Existing hash functions

## Hashing numerical indices using the remainder

``` rust
fn hash(index: u64) -> u64 {
    index %  10
}

fn main() {
    for i in 0..100 {
        println!("{} => {}", i, hash(i));
    }
}
```

## Additive hash

## XOR hash

## Rotating hash

## Bernstein hash

## Modified Bernstein

## Shift-Add-XOR hash

## FNV hash

* https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function

## One-at-a-Time hash

## ELF hash

## Jenkins hash

* https://en.wikipedia.org/wiki/Jenkins_hash_function

##  Pearson hashing

* https://en.wikipedia.org/wiki/Pearson_hashing

##  Murmur hash

* http://stackoverflow.com/questions/11899616/murmurhash-what-is-it
* http://stackoverflow.com/questions/1057036/please-explain-murmur-hash
* https://en.wikipedia.org/wiki/MurmurHash


## More

* http://www.azillionmonkeys.com/qed/hash.html
* https://en.wikipedia.org/wiki/Hash_function
* http://eternallyconfuzzled.com/tuts/algorithms/jsw_tut_hashing.aspx
* https://en.wikipedia.org/wiki/NIST_hash_function_competition
* https://www.strchr.com/hash_functions
* http://research.neustar.biz/2011/12/05/choosing-a-good-hash-function-part-1/
* http://research.neustar.biz/2011/12/29/choosing-a-good-hash-function-part-2/
* http://research.neustar.biz/2012/02/02/choosing-a-good-hash-function-part-3/
