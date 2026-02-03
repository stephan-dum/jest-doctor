---
title: Migration
---
# Migration

This guide explains how to introduce jest-doctor into an existing Jest test suite with minimal disruption, predictable outcomes, and clear rollback options.
Adopting jest-doctor in large or legacy codebases should be done incrementally to avoid blocking development while steadily improving test reliability

The goal is:

> Prevent new async leaks while gradually fixing existing ones.

Before introducing jest-doctor:

- check if your [environment is supported](https://stephan-dum.github.io/jest-doctor/#-tested-against)
- check the [when not to use jest-doctor](https://stephan-dum.github.io/jest-doctor/#-when-not-to-use-jest-doctor) section
- be aware of the [limitations](https://stephan-dum.github.io/jest-doctor/#-Limitations-and-known-edge-cases)
- Make sure to onboard all developers and they agree to that stricter enforcement
- decide on the code hygiene level to apply.

## Phase 1 — Observe (Warnings Only)

Enable jest-doctor but configure all leak types as warnings.
This will help to find existing issues while avoiding CI failures.

```js
const options = {
  report: {
    timers: {
      onError: 'warn',
    },
    fakeTimers: {
      onError: 'warn',
    },
    promises: {
      onError: 'warn',
    },
    console: {
      onError: 'warn',
    },
    processOutputs: {
      onError: 'warn',
    },
    domListeners: {
      onError: 'warn',
    },
  },
  delayThreshold: Infinity,
};
```

## Phase 2 — Analyze & Fix High-Impact Leaks

Enable the reporter and do a first run to get a baseline.
Repeat this to track progress and gain metrics over time.

The reporter sorts the leaks by severity so you can quickly tell which test needs most attention.
Analyze the report and create tasks for repetitive leaks and low hanging fruits.

Prioritize fixing:

- Floating promises
- Open timers
- Fake timers not cleared

This usually removes most flakiness quickly.

## Phase 3 continuously improve tests

Chose one of the following plans depending on your needs.

### ✅ Use --changedSince

If jest internal `--changedSince` flag is already used it makes transition straight forward.
By creating a separate config for jest-doctor all tests can be still executed without disruption.

```bash
jest --config jest.doctor.config.js --changedSince=origin/main
```

### ✅ Use Separate Jest Config with Patterns

Opt-in strict testing via file naming or folders:

```js
const config = {
  testMatch: ['**/*.test.fixed.ts'],
  // ...
};
```

Over time, expand coverage until full suite uses jest-doctor.

## ⚠️ About “Fail CI Only on New Leaks”

Raw leak counts — especially promise leaks — may vary by:

- Node version
- OS / architecture
- event loop scheduling differences

So do not rely on comparing total counts!
