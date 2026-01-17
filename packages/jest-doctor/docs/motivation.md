# Motivation

##  The core problem: Jest allows invalid tests to pass

Jest’s execution model does not enforce test isolation.

Nothing in Jest guarantees that:
- All Promises created by the test have resolved
- All timers have been cleared
- All async side-effects have stopped

This leads to tests that are logically incorrect but operationally passing.

Example:
```js
it('fetches data', async () => {
  fetchData(); // returns a promise, but we forget to await it
});
```

This test: **Passes**, but leaves async work running. This can mutate global state later, Jest considers this valid whereas jest-doctor does not.

## Why leaks are worse than failures
A failing test is noisy and obvious.
A leaking test is silent, delayed, and contagious.

Leak symptoms often appear as:
- Random test failures in unrelated files
- Snapshot mismatches
- Timeouts in later tests
- CI failures that cannot be reproduced locally

The root cause is often many tests earlier.

## Async leaks break determinism

A fundamental invariant of testing is:

> Running tests in a different order should not change results.

Promises are the most dangerous leak type.

Promises are:
- Implicit
- Easy to forget
- Hard to observe

A Promise can:
- Resolve long after a test ends
- Throw errors outside test context
- Mutate shared state silently

