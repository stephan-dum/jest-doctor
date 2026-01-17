Migration Guide: Adopting jest-doctor in Existing Jest Suites

This guide explains how to introduce jest-doctor into an existing Jest test suite with minimal disruption, predictable outcomes, and clear rollback options.

jest-doctor enforces async correctness and test isolation. As a result, existing test suites may surface failures that were previously hidden.

This is expected.

1. Migration goals

A successful migration should:

Surface existing async isolation issues

Avoid destabilizing CI pipelines unexpectedly

Allow teams to fix issues incrementally

Preserve confidence in test results

2. Before you begin
   Recommended prerequisites

Before adopting jest-doctor, ensure that:

Your Jest suite is already passing consistently

Flakiness is a known or suspected issue

The team agrees that stricter enforcement is acceptable

jest-doctor is most effective when introduced deliberately, not opportunistically.

3. Migration strategies

There are three recommended adoption strategies, depending on your tolerance for disruption.

Strategy A: New tests only (lowest risk)

Recommended for large or legacy codebases

Create a new Jest project or config:

// jest.doctor.config.js
module.exports = {
testEnvironment: 'jest-doctor/env/node',
testMatch: ['**/*.doctor.test.ts'],
};


Gradually move or write new tests under this configuration

Pros

Zero disruption to existing tests

Clear signal for new code quality

Cons

Existing leaks remain unfixed

Two environments to maintain

Strategy B: Per-package or per-folder rollout (balanced)

Recommended for monorepos or modular codebases

Enable jest-doctor for a subset of tests:

module.exports = {
projects: [
{
displayName: 'legacy',
testEnvironment: 'node',
testMatch: ['packages/legacy/**'],
},
{
displayName: 'strict',
testEnvironment: 'jest-doctor/env/node',
testMatch: ['packages/new/**'],
},
],
};


Gradually expand coverage

Pros

Incremental enforcement

Issues isolated to specific areas

Cons

Slightly more configuration complexity

Strategy C: Full suite adoption (highest confidence, highest effort)

Recommended for infrastructure teams or CI-first organizations

Update your Jest configuration:

module.exports = {
testEnvironment: 'jest-doctor/env/node',
};


Run the full test suite

Address reported isolation violations

Pros

Immediate correctness guarantees

Eliminates hidden flakiness quickly

Cons

Initial failure volume may be high
