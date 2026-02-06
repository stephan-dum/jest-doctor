---
title: Motivation
---

# Motivation

Reliable tests are essential for maintaining confidence in your code.
But in Jest, a test can pass while still **leaking async work**.

## The problem

Jest does not fully enforce async test isolation.
Even with `--detectOpenHandles`, it does not fail when some async work continues after a test ends.

Nothing in Jest guarantees that:

- All async work triggered by the test has completed
- All timers have been cleared
- All async side effects have stopped

This leads to tests that appear to pass but are incorrect.

Example:

```js
it('fetches data', async () => {
  // returns a promise, but we forget to await it
  fetchData().then((data) => {
    putItInGlobalStore(data);
  });
});
```

This test: **Passes**, but leaves async work running.
This can mutate global state later.
To address these issues, jest-doctor ensures tests fail if any async operations remain unresolved.

## Why this matters

A failing test is noisy and clear.
A leaking test is silent and can corrupt other tests.

Leaks often show up as:

- Random failures in unrelated files
- Snapshot mismatches
- Timeouts in later tests
- CI failures that cannot be reproduced locally

By the time you see the failure, the leaking test may be far earlier in the run.

## Async leaks break determinism

A fundamental invariant of testing is:

> Running tests in a different order should not change results.

Async leaks violate this rule.

Promises are especially dangerous leak sources.

Promises are:

- Easy to forget
- Cannot be canceled
- Can continue running after the test ends

A Promise can:

- Resolve long after a test ends
- Throw errors outside test context
- Mutate shared state silently

jest-doctor enforces a simple rule:

**when a test ends, all async work must be done.**
