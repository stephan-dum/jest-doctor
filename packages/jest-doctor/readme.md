# jest-doctor [![main](https://github.com/stephan-dum/jest-doctor/actions/workflows/main.yml/badge.svg)](https://github.com/stephan-dum/jest-doctor/actions/workflows/main.yml) [![codecov](https://codecov.io/gh/stephan-dum/jest-doctor/branch/main/graph/badge.svg)](https://codecov.io/gh/stephan-dum/jest-doctor) [![npm version](https://img.shields.io/npm/v/jest-doctor.svg)](https://www.npmjs.com/package/jest-doctor) [![License](https://img.shields.io/npm/l/jest-doctor.svg)](./LICENSE)

jest-doctor is a custom Jest environment that fails tests deterministically
when [async work leaks](#what-is-an-async-leak) across test boundaries.
It prevents flaky tests and enforces strong test hygiene.

## ✨ What problems does it catch?

It detects and reports when tests:
- Leave unresolved Promises
- Leave open real or fake timers
- Rely on excessive real-time delays
- Emit process / console outputs

---
**Docs**

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Reporter](#reporter)
- [When not to use jest-doctor](#when-not-to-use-jest-doctor)
- [Limitations](#limitations)
- [FAQ](#faq)
- [Migration](./docs/migration.md)

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

```js
export default {
  testEnvironment: 'jest-doctor/env/node',
  // optional
  reporters: ['default', 'jest-doctor/reporter'],
};
```

Out-of-the-box jest-doctor supports node and jsdom environments. But you can also [build your own environment](./docs/build_your_own_environment.md).

---
## ⚙️ Configuration

The environment can be configured through the Jest config `testEnvironmentOptions`:


```js
export default {
  testEnvironmentOptions: {
    report: {
      console: {
        onError: 'warn',
        methods: ['log', 'warn', 'error'],
        ignore: /Third party message/,
      },
      timers: {
        onError: 'warn',
      },
      fakeTimers: {
        onError: 'throw',
      },
      promises: false,
      processOutputs: {
        onError: 'warn',
        methods: ['stderr'],
      },
    },
    delayThreshold: 1000,
    timerIsolation: 'afterEach',
    clearTimers: true,
  },
};
```

### report
Controls which leak types are detected and how they are reported.

Each option can be:
- false → disabled
- object → enabled with configuration

Common options:
- **onError**: `'warn' | 'throw'` (default: `'throw'`)
- ignore: `string | RegExp | Array<string | RegExp>` (default: `[]`)
  If the stack trace or emitted message matches, the leak is ignored.

#### possible report options

- **timers:** track real timers
- **fakeTimers:** track fake timers
- **promises:** track not awaited promises
- **console:** track console output
  - **methods:** `Array<keyof Console>` (default: all) which console methods should be tracked
- **processOutputs:** track process output
  - **methods:** `Array<'stderr' | 'stdout'>` (default: both) which process output methods should be tracked

###  timerIsolation
Controls when timers are validated and cleared.

**afterEach** (default)
`beforeAll`, `beforeEach` and `afterAll` are still immediate but `test` / `it` and `afterEach` block defer reporting and cleanup until the last `afterEach` block is executed (or directly after the test if there are no `afterEach` blocks).

```
beforeAll  → check
beforeEach → check
test       → defer
afterEach  → defer
afterEach  → final check
afterAll   → check
```

This allows easier cleanup., for example react testing framework registers an unmount function in an `afterEach` block to clean up.
The disadvantage of this method is that it can happen that in an afterEach block a long-running task is executed and while running it timers resolve unnoticed.

**immediate**
timers are checked **after** each test / hook block
```
beforeAll  → check
beforeEach → check
test       → check
afterEach  → check
afterAll   → check
```
Use when tests should clean up immediately.

### delayThreshold
`number` (default: `0`)

The delay in milliseconds of all `setTimeout` and `setInterval` callback that get executed is added up.
If the sum is higher than the threshold, an error is thrown; otherwise a warning is logged.
This feature should helps to detect tests that accidentally rely on real time.

### clearTimers
`boolean` (default: `true`)

Whether timers should be cleared automatically based on `timerIsolation`.

### verbose
`boolean` (default: `false`)

Jest often hides stack traces and files are not clickable.
Also it is only possible to report one error type at a time.
This option will print all errors with the related stack traces.

---
## 📊 Reporter

The reporter aggregates leaks across all test environments and prints:

- Total number of leaks
- Grouped by type (timers, promises, console, etc.)
- Ordered by severity

The environment writes temporary reports to disk and the reporter reads them.

The reporter can be configured by the standard jest reporter config syntax

Options:

- **jsonFile**: `string`: (default: null) file path where a json version of the report should be saved to.
- **tmpDir**: `string` (default: `.tmp`) Directory used to exchange data between environment and reporter.

```js
export default {
  reporters: [
    'default',
    [
      'jest-doctor/reporter',
      {
        tmpDir: 'custom-dir',
        jsonFile: 'report.json',
      }
    ]
  ],
};
```

---
## ⚠️ Limitations

### No it.concurrent
Concurrent tests cannot be isolated reliably. jest-doctor replaces them with
a synchronous version to guarantee deterministic cleanup.

### No done callbacks or generators
Since this is also a legacy pattern, it is not supported to avoid unnecessary complexity.

### Results are inconsistent
Promises are handled differently depending on the OS and node version.
This means the report will always look a bit different depending on the environment.

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
  - detect floating promises
  - disallow setTimeout / setInterval in tests
  - disallow console usage
- Only mock console / process output *per test* not globally, to avoid missing out on errors that are thrown in silence
- Avoid listening for process.on event like unhandledRejection because jest already does this for you and it can lead to memory leaks if not unregistered properly.
- Enable fake timers globally in config (be aware that there might be some issues ie axe needs real timers)

```js
afterEach(async () => {
  jest.useRealTimers();
  await axe();
  jest.useFakeTimers();
});
```

---
## 🧪 Tested Against

This project is tested against the following combinations:
- **jest**: 28, 29, 30
- **node**: 20, 22, 24

---
# ❓ FAQ

### How to migrate an existing project?

Please read the [migration guide](./docs/migration.md).

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

In the best case it just pollutes the console.
In the worst case a real bug is logged but ignored.
Thats why tests should always spy on console and assert on the output.
The [react example](./e2e/fixtures/react.fixture.tsx#L32-L37) shows a common problem that can be caught by tests that mock console correctly.

---

If jest-doctor helped you eliminate flaky tests, consider ⭐ starring the repo —
it helps others discover the project and motivates continued development.
