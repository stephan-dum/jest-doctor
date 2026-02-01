---
---
# Configuration

This page explains how to configure jest-doctor in detail.

Basic example:

```js
export default {
  testEnvironmentOptions: {
    report: {
      console: {
        onError: 'warn',
        methods: ['log', 'warn', 'error'],
        ignoreMessage: /Third party message/,
      },
      timers: {
        onError: 'warn',
      },
      fakeTimers: {}, // enabled, will use defaults
      promises: false,
      domListeners: {
        onError: 'warn',
        ignoreStack: 'node_modules/history',
      },
      processOutputs: {
        onError: 'warn',
        methods: ['stderr'],
      },
    },
    verbose: true,
    delayThreshold: Infinity, // disabled
    timerIsolation: 'immediate',
    clearTimers: false,
  },
};
```

## `report`

Controls which leak types are detected and how they are reported.

Each option can be:

- `false` → disabled
- `object` → enabled with configuration

### Common options

These options are common to all `report` subtypes.

- `onError`: `'warn' | 'throw'` (default: `'throw'`)
  controls how leaks are handled
- `ignoreStack`: `string | RegExp | Array<string | RegExp>` (default: `[]`)
  If the stack trace matches any entry, the leak is ignored.

### Possible `report` options

- `timers`: track real timers
- `fakeTimers`: track fake timers
- `promises`: track not awaited promises
- `domListeners`: track not removed DOM listeners
- `console`: track console output
  - `methods`: `Array<keyof Console>` (default: all) which console methods should be tracked
  - `ignoreMessage`: same as ignoreStack but for the message
- `processOutputs`: track process output
  - `methods`: `Array<'stderr' | 'stdout'>` (default: both) which process output methods should be tracked
  - `ignoreMessage`: same as ignoreStack but for the message

## `timerIsolation`

Controls when timers are validated and cleared.

### `afterEach` (default)

`beforeAll`, `beforeEach` and `afterAll` are still immediate but `test` / `it` and `afterEach` block defer reporting and cleanup until the last `afterEach` block is executed (or directly after the test if there are no `afterEach` blocks).

```
Hook       → Check?
--------------------
beforeAll  → ✅
beforeEach → ✅
test       → ⏳
afterEach  → ⏳
afterEach  → ✅
afterAll   → ✅
```

- ✅ = timer and async leaks are checked immediately
- ⏳ = timer leaks are deferred until the final afterEach

This allows easier cleanup. For example, React Testing Library registers an unmount function in an `afterEach` block.
The disadvantage is that if a long-running task executes in an `afterEach` block, timers may resolve without being tracked.

Use `afterEach` if your tests clean up resources in hooks (e.g., React Testing Library).

### `immediate`

Timers are checked **after** each test or hook block.

```
Hook       → Check?
--------------------
beforeAll  → ✅
beforeEach → ✅
test       → ✅
afterEach  → ✅
afterAll   → ✅
```

Use `immediate` if you need stricter timing checks.

## `delayThreshold`

`number` in milliseconds (default: `0`)

The delay in milliseconds of all `setTimeout` and `setInterval` callback that get executed is added up.
If the sum is higher than the threshold, an error is thrown; otherwise a warning is logged.
This feature helps detect tests that unintentionally rely on real time.
Setting it to `Infinity` will disable the detection.

## `clearTimers`

`boolean` (default: `true`)

Whether timers should be cleared automatically based on `timerIsolation`.

## `verbose`

`boolean` (default: `false`)

By default, Jest hides some stack traces and only reports one error type at a time.
Enabling verbose prints all detected leaks with full stack traces, making debugging easier.
