---
title: Architecture
---
# Architecture

This document explains how jest-doctor integrates with Jest and enforces test isolation.
<!--more-->
## Non-goals

- Not a performance profiler
- Not a linter
- Not a replacement for Jest's `--detectOpenHandles`

## High-level design

jest-doctor works by **augmenting the Jest test environment**, not by modifying test code.

Core ideas:

1. Each test owns its async resources
2. Upon test end, async resources must fully clean
3. Any leftover resource is a hard failure

This design prioritizes deterministic failures over permissive behavior.

## Integration points

jest-doctor provides custom environments:

- `jest-doctor/env/node`
- `jest-doctor/env/jsdom`

These environments:

- Extend Jest’s default environments
- Patch global APIs
- Track async lifecycle per test

## Execution lifecycle

For each test:

1. **Before test**
    - Initialize leak records
    - Patch globals (timers, console, test functions)
    - Start async_hooks tracking
2. **During test**
    - Attribute async resources to current test
    - Capture creation stack traces
3. **After test**
    - Detect leftover async resources
    - Report leaks
    - Cleanup globals and hooks

## Leak Detection Internals

This section describes how jest-doctor detects leaks.

### Leak categories

jest-doctor currently detects:

| Category       | Detection mechanism                 |
| -------------- | ----------------------------------- |
| Promises       | `async_hooks`                       |
| Timers         | Global API patching                 |
| Fake timers    | Jest fake timer patching            |
| Console output | Console method patching             |
| Process output | process method patching             |
| DOM listeners  | (add/remove)-EventListener patching |

### Promise detection

- Uses `node:async_hooks`
  - [createAsyncHookDetector.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/createAsyncHookCleaner.ts)
  - [createAsyncHookCleaner.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/createAsyncHookCleaner.ts)
- Tracks async resources of type `PROMISE`
- Records:
  - stack trace
  - asyncId
  - parentAsyncId
- To support concurrent promises `Promise.race`, `Promise.any` and `Promise.all` they are patched as well.
  - [promiseConcurrency.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/promiseConcurrency.ts)
  - handles untracking of losing promises
  - (!) cannot handle nested promises, see [known limitations](https://stephan-dum.github.io/jest-doctor/#limitations)

### Real timers

Global functions are patched [timers.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/timers.ts):

- `setTimeout`
- `setInterval`
- `clearTimeout`
- `clearInterval`
- `setImmediate`
- `clearImmediate`

Records:

- stack trace
- type: which of the patched method created the leak
- isAllowed: if the leak should be reported. It is still necessary to track all timers if the option `clearTimers` is `true` but `report.timers` is `false`, to be able to clear them.

The legacy fake timer global useRealTimers function is also patched to restore patches once applied.

### Fake timers

Used when Jest fake timers are enabled [fakeTimers.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/fakeTimers.ts):

- patches global useFakeTimers for legacy and modern fake timers to know when to patch the timers
- patches same methods as real timers with similar records
- it uses `Object.assign` to preserve existing mocking

### Console detection

Console methods are patched [console.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/console.ts)

Console output is treated as a leak.

Records:

- stack trace
- method

**Rationale:**

Treating console output as a leak is a deliberate strictness choice.
This enforces explicit assertions and prevents silent failures in CI.
The [react example](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/e2e/fixtures/react.fixture.tsx#L32-L37) shows a common problem that can be caught by tests that mock console correctly.

### Process outputs

process.(stderr/stdout).write are patched [processOutput.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/processOutput.ts):

- Process output is treated as a leak.
- Same records as console.
- This will not fire if already caught by console.

### DOM Listeners

window.(add/remove)EventListener are patched [domListeners.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/domListeners.ts)

Attached DOM listeners after a test are treated as a leak.

Records:

- stack trace
- event
- handler
- options

### Ownership attribution

All resources are associated using:

- `currentTestName` (becomes `main-thread` if not associated with a test)
- Patches `it`, `test`, and lifecycle hooks
  - [it.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/it.ts)
  - [hook.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/hook.ts)

This ensures:

- Correct attribution
- Accurate error reporting
- all leaks attributed with `main-thread` will be reported at the end of the test suite
  - usually this is a sign that the `beforeAll`, `afterAll` or other global code has leaks.

## Cleanup

jest-doctor will clear open timers to avoid cascading failures and ensure test isolation.
Clean up happens after each test and will not interfere with reporting.

But it will still **throw or warn** based on configuration.
Warnings and errors never suppress cleanup or attribution.

[cleanupAfterTest.ts](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/src/patch/cleanupAfterTest.ts)

## Error reporting

Leaks are reported with:

- Leak type
- stack

A single error is thrown per test for clarity.

All reports are summed up and sent to the reporter at the end of each test file.
