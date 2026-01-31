---
title: jest-doctor docs
---
# jest-doctor

[![main](https://github.com/stephan-dum/jest-doctor/actions/workflows/main.yml/badge.svg)](https://github.com/stephan-dum/jest-doctor/actions/workflows/main.yml) [![codecov](https://codecov.io/gh/stephan-dum/jest-doctor/branch/main/graph/badge.svg)](https://codecov.io/gh/stephan-dum/jest-doctor) [![npm version](https://img.shields.io/npm/v/jest-doctor.svg)](https://www.npmjs.com/package/jest-doctor) [![License](https://img.shields.io/npm/l/jest-doctor.svg)](./LICENSE)

jest-doctor is a custom Jest environment that fails tests deterministically
when [async work leaks](#what-is-an-async-leak) across test boundaries.
The goal is to prevent flaky tests and enforce strong test hygiene.

## ✨ What problems does it catch?

It detects and reports when tests:

- Leave unresolved promises
- Leave open real or fake timers
- Leave DOM listeners attached
- Rely on excessive real-time delays
- Produce unexpected console or process output

---

## 🚀 Quick Start

```bash
npm install --save-dev jest-doctor
```

or

```bash
yarn add -D jest-doctor
```

Add one of the provided environments to your `jest.config.js`.
Out-of-the-box jest-doctor supports node and jsdom environments. But you can also [build your own environment](./docs/build_your_own_environment.md).

```js
export default {
  testEnvironment: 'jest-doctor/env/node',
  // optional
  reporters: ['default', 'jest-doctor/reporter'],
};
```

After running tests, a report like this is shown for each detected leak:

![report promise leak](https://raw.githubusercontent.com/stephan-dum/jest-doctor/refs/heads/main/packages/jest-doctor/docs/leaks-promise.jpg)

---

**Other Docs**

- [Configuration](https://stephan-dum.github.io/jest-doctor/configuration)
- [Motivation](https://stephan-dum.github.io/jest-doctor/motivation)
- [Migration](https://stephan-dum.github.io/jest-doctor/migration)
- [Build your own environment](https://stephan-dum.github.io/jest-doctor/build_your_own_environment)
- [Architecture](https://stephan-dum.github.io/jest-doctor/architecture)
- [How to Contribute](https://stephan-dum.github.io/jest-doctor/how_to_contribute)

---

## Why Jest's `--detectOpenHandles` is not enough

Jest already offers a built-in solution to detect open handles.
But it often does not report any issues and will not provide actionable advice.
The [motivation page](./motivation.md) goes into more detail.

---

## ⚙️ Configuration

The environment can be configured through the Jest config `testEnvironmentOptions`.

List of all available options:

- report
  - console
  - processOutputs
  - fakeTimers
  - timers
  - promises
  - domListeners
- delayThreshold
- timerIsolation
- clearTimers
- verbose

A detailed description of the configuration options can be found at [./docs/configuration.md](./docs/configuration.md).

---

## 📊 Reporter

The reporter aggregates leaks across all test environments and prints:

- Total number of leaks
- Grouped by type (timers, promises, console, etc.)
- Ordered by severity

The environment writes temporary reports to disk and the reporter reads them.

The reporter can be configured using standard Jest reporter configuration syntax.

Options:

- **jsonFile**: `string`: (default: null) File path where a JSON version of the report should be saved.
- **tmpDir**: `string` (default: `.tmp`) Directory used to exchange data between the environment and the reporter. (should be added to `.gitignore`)

```js
export default {
  reporters: [
    'default',
    [
      'jest-doctor/reporter',
      {
        tmpDir: 'custom-dir',
        jsonFile: 'report.json',
      },
    ],
  ],
};
```

---

## How jest-doctor works

- Wraps the Jest environment
- Tracks async resource creation
- Checks at test boundaries
- Throws or warns based on configuration
- Optional: Reports through a custom reporter

For a more detailed explanation, see the [architecture](https://stephan-dum.github.io/jest-doctor/architecture) section.

---

## ⚠️ Limitations

### No it.concurrent

Concurrent tests cannot be isolated reliably. jest-doctor replaces them with
a synchronous version to guarantee deterministic cleanup.

### No done callbacks or generators

Callback-style async and generators are legacy patterns and are not supported to keep the implementation reliable and maintainable.

### Environment-dependent results

Promise scheduling differs by OS and Node version,
so exact leak ordering and grouping may vary.

### Microtasks resolving in same tick are not tracked

This is a JavaScript limitation, not specific to jest-doctor.

```js
Promise.resolve().then(() => {
  /* i am not tracked as unresolved */
});
```

### Concurrent promise combinators with nested async are problematic

`Promise.race`, `Promise.any`, `Promise.all` cannot safely untrack nested async:

```js
const doSomething = async () => {
  // both promises will be tracked and never released
  await someAsyncTask();
  return new Promise(() => {
    setTimeout(resolve, 10);
  });
};

const p1 = Promise.resolve().then(() => {
  /* no problem if not async */
});

const p2 = Promise.resolve().then(
  () =>
    new Promise((resolve) => {
      /* this promise will be also always tracked */
      resolve();
    }),
);

await Promise.race([p1, p2, doSomething()]);
```

### Imported timers bypass tracking

These timers are not intercepted. This can also be used as an escape hatch.

```js
import { setTimeout, setInterval } from 'node:timers';
```

---

## 🚫 When not to use jest-doctor

- Heavy integration tests with background workers
- Tests relying on long-running real timers
- Legacy test suites using callback-based async

In such cases, consider selectively disabling checks or using ignore rules.

---

## 💡 Recommendations

- Use ESLint to
  - Detect floating promises
  - Disallow `setTimeout` or `setInterval` in tests
  - Disallow console usage
- Only mock console / process output _per test_ not globally, to avoid missing out on errors that are thrown in silence.
- Avoid listening to process.on events like unhandledRejection, because Jest already handles these and failing to unregister handlers can cause memory leaks.
- Enable fake timers globally in config.

---

## 🧪 Tested Against

This project is tested against the following combinations:

- **Jest**: 28, 29, 30
- **Node**: 20, 22, 24

---

# ❓ FAQ

### How to migrate an existing project?

Please read the [migration guide](https://stephan-dum.github.io/jest-doctor/docs/migration).

### Why is jest-doctor so strict?

Because flaky tests cost more than broken builds.

### Does this slow tests down?

Slightly. Overhead is intentional and bounded.

### What is an async leak?

An async leak happens when a test starts asynchronous work but does not
properly wait for or clean it up. This can:

- Interfere with later tests
- Cause flaky failures
- Hide real bugs

### Why does console output fail tests?

Treating console output as a leak is a deliberate strictness choice.
This enforces explicit assertions and prevents silent failures in CI.

- Prevents polluting the console
- Prevents real bugs from being logged and ignored

The [react example](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/e2e/fixtures/react.fixture.tsx#L32-L37) shows a common problem that can be caught by tests that mock console correctly.

---

If jest-doctor helped you eliminate flaky tests, consider ⭐ starring the repo —
it helps others discover the project and motivates continued development.
