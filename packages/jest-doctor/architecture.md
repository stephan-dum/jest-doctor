# jest-doctor Architecture

This document explains how jest-doctor integrates with Jest and enforces test isolation.

---

## High-level design

jest-doctor works by **augmenting the Jest test environment**, not by modifying test code.

Core ideas:
1. Each test owns its async resources
2. Async resources must be fully cleaned up by test end
3. Any leftover resource is a hard failure

---

## Integration point

jest-doctor provides custom environments:

- `jest-doctor/env/node`
- `jest-doctor/env/jsdom`

These environments:
- Extend Jest’s default environments
- Patch global APIs
- Track async lifecycle per test

---

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

---

## Why environments instead of matchers?

Leak detection must:
- Observe async creation
- Intercept timers and promises
- Run outside user control

This is only possible at the **environment level**.

---

## Failure model

jest-doctor:
- Never silently cleans leaks
- Never retries tests
- Never downgrades errors to warnings

Failures are **deterministic and immediate**.

---

# Leak Detection Internals

This document describes how jest-doctor detects async leaks.

---

## What is a “leak”?

A leak is any async side-effect that outlives the test that created it.

Examples:
- Unresolved Promises
- Active timeouts or intervals
- Console output after test completion

---

## Leak categories

jest-doctor currently detects:

| Category        | Detection mechanism        |
|-----------------|----------------------------|
| Promises        | `async_hooks`              |
| Timers          | Global API patching        |
| Fake timers     | Jest fake timer patching   |
| Console output  | Console method interception|

---

## Promise detection

### How it works

- Uses `node:async_hooks`
- Tracks async resources of type `PROMISE`
- Records:
  - asyncId
  - creation stack
  - owning test name

### Why PROMISE only?

Other async types (Timeout, Immediate) are:
- Noisy
- Better detected via explicit timer patching

This keeps promise detection precise and low-noise.

---

## Timer detection

### Real timers

Global functions are patched:
- `setTimeout`
- `setInterval`
- `clearTimeout`
- `clearInterval`

Each timer records:
- ID
- Stack trace
- Owning test

### Fake timers

When Jest fake timers are enabled:
- Separate tracking is used
- Fake timers are isolated from real timers
- Prevents false positives when switching modes

---

## Console detection

Console methods are patched:
- `log`
- `warn`
- `error`
- etc.

Console output after test completion is treated as a leak.

Rationale:
- Indicates async work running outside test lifecycle
- Often masks unresolved promises or timers

---

## Ownership attribution

All resources are associated using:
- `currentTestName`
- Patched `it`, `test`, and lifecycle hooks

This ensures:
- Correct attribution
- Accurate error reporting

---

## Cleanup vs detection

jest-doctor may:
- Drain promises
- Clear timers

**But cleanup does not prevent failure.**

Cleanup exists to:
- Avoid cascading failures
- Preserve test isolation

Detection is based on **pre-cleanup state**.

---

## Error reporting

Leaks are reported with:
- Leak type
- Test name
- Creation stack trace

A single error is thrown per test for clarity.

---

## Design goals

- Deterministic failures
- Zero false negatives
- Acceptable false positives over silent bugs
