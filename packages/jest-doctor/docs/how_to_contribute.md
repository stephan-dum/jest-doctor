---
title: How to contributing
---

# How to contributing

Thank you for your interest in contributing to **jest-doctor**!

We welcome bug reports, documentation improvements, and code contributions.
Because jest-doctor operates at a very low level of Jest’s runtime, contributions are expected to be **careful, well-tested, and explicit about tradeoffs**.

By participating in this project, you agree to be [respectful and constructive](https://github.com/stephan-dum/jest-doctor/blob/main/CODE_OF_CONDUCT.md) in discussions and reviews.

## Project philosophy

Most design decisions in this repo are guided by the following principles:

- **Tests must be isolated** – each test fully owns its async resources
- **Leaks are failures** – false negatives are worse than false positives
- **No magic in userland** – detection happens via the Jest environment, not test rewrites
- **Determinism over convenience** – behavior must be predictable across machines and CI

If a change weakens any of these guarantees, expect it to be discussed during review.

## Repository structure

```
src/
  env/               # Custom Jest environments (node / jsdom)
  patch/             # Global API patches (timers, promises, console, it/test)
  utils/             # Shared helpers and leak-reporting utilities
  reporter.ts        # Jest reporter implementation
  createEnvMixin.ts  # mixin to create jest environments

e2e/
  fixtures/          # Jest projects used for end‑to‑end testing
  tests/             # E2E tests asserting real Jest behavior
```

If you are new to the project, start with [architecture](https://stephan-dum.github.io/jest-doctor/architecture/).

## Getting started

### Prerequisites

- Node >=24
- yarn

### Installation

```bash
yarn install
```

### Run end-to-end tests

```bash
yarn test:matrix
```

The command also supports two optional parameters the major jest version to test and a test file matcher pattern.
For example to test jest 30 only fake-timer test:

```bash
yarn test:matrix 30 fake-timer
```

E2E tests execute real Jest runs using the fixtures in `e2e/fixtures` and are focused on case coverage.
These tests are essential for validating behavior across environments and Jest versions.
The [readme.md](https://github.com/stephan-dum/jest-doctor/blob/main/packages/jest-doctor/e2e/readme.md) inside e2e folder gives more insights on how they work in the background.

### Run unit tests

```bash
yarn test:unit
```

Those unit tests should compliment the E2E tests and can be used to extend coverage and test parts that are not part of a use case.

### Merging coverage

```bash
yarn coverage:merge
```

This will merge both unit and E2E coverage into a single report which is stored inside coverage directory.

## Development workflow

1. Fork the repository
2. Create a new branch from `main`
3. Make focused, incremental changes
4. Add or update tests
5. Ensure all tests pass

Avoid mixing unrelated changes in a single PR.

## Testing requirements

jest-doctor is **test-heavy by design**.

### Unit tests

- Located next to source files (`*.test.ts`)
- Focus on small, deterministic behaviors
- Must not rely on real timers

### End-to-end tests

- Located in `e2e/tests`
- Assert **observable Jest behavior**, not implementation details
- Prefer adding E2E coverage for bug fixes and new detection logic
- be aware that windows symlinks will resolve to the wrong directory,
  effectively only testing jest 30 which is installed globally. (use the PR pipeline in such cases)

A PR that changes runtime behavior without tests is unlikely to be merged.

## Style guidelines

- TypeScript (strict mode)
- Prefer clarity over cleverness
- Avoid side effects at module scope
- Keep utilities small and well-named

Linting is enforced via ESLint.

## Documentation

Documentation lives in `docs/`.

Please update docs when you:

- Change observable behavior
- Add configuration options
- Introduce new reports or failure modes

## Submitting a pull request

### Pull request checklist

When opening a PR, make sure:

- Documentation is updated accordingly
- coverage at 100% (unit + e2e merged)
- PR description highlights the most important changes

### PR description guidelines

A good PR description includes:

- Context and motivation
- What changed
- Any known limitations or follow-ups

Small, focused PRs are strongly preferred over large refactors.

## Getting help

If you’re unsure about an approach:

- Open a discussion
- Start with a draft PR
- read docs ie [architecture](https://stephan-dum.github.io/jest-doctor/architecture/)

Design discussion and questions are very welcome.

---

Thanks for contributing — every improvement makes flaky tests a little less powerful 💪
