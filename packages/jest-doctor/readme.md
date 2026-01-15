# jest-doctor

**jest-doctor** is a custom Jest environment that **detects async leaks and test isolation bugs**.

It fails tests deterministically when they:
- Leave unresolved Promises
- Leak timers or intervals
- Emit console output

jest-doctor is intentionally strict. If your test leaks async work, that is a bug, even if Jest would normally ignore it.

## Installation

```bash
npm install --save-dev jest-doctor
```
or
```bash
yarn add -D jest-doctor
```

## Usage

Add one of the provided environments to your `jest.config.js`.

```js
export default {
  testEnvironment: 'jest-doctor/env/node',
};
```

Out of the box node and jsdom are supported. If other environments are needed simple use the createEnvMixin helper.
Simply create a new file in your code base and reference it in you jest.config.js.

```js
const createEnvMixin = require('jest-doctor/createEnvMixin').default;
const NodeEnvironment = require('jest-environment-node').default;
const MyEnv = require('my-env').default;

// eigther wrap the desire existing environment
const JestDoctorMyEnv = createEnvMixin(MyEnv);

// or pass in your own class
class MyClass extends NodeEnvironment {}
const JestDoctorMyEnv = createEnvMixin(MyClass);

// dont forget to export
module.exports = JestDoctorMyEnv;
```

### Configuration

The environment can be configured through jest config `testEnvironmentOptions`:
- **report**: an object defining which leaks should be tracked and reported
  - **timers**: `false | 'warn' | 'trow'` (default `throw`) whether normal setTimeout and setInterval should be reported and how
  - **fakeTimers**: `false | 'warn' | 'trow'` (default `throw`) same as timers but for fake api
  - **promises**: `false | 'warn' | 'trow'` (default `throw`) indicating if promises should be reported and how
  -  **console**: `false` or object (default object)
      - **onError**: `'warn' | 'trow'` (default `throw`) how to handle reporting
      - **methods**: `keyof Console` (default all methods) which console methods should be tracked
      - **ignore**: `string | regexp | Array<string | regexp>` (default: []) allows to excluded console output from tracking
- **timerIsolation**: `'afterEach' | 'immediate'` (default: `'afterEach'`)
  - **immediate**: report and clear timers directly after each test / hook block
  - **afterEach**: `beforeAll`, `beforeEach` and `afterAll` are immediate but `test` and `afterEach` block defer reporting and cleanup until the last `afterEach` block is executed (or directly after the test if there are no `afterEach` blocks). This allows an easier clean up for example react testing framework registers an unmount function in an `afterEach` block to clean up.
- **delayThreshold**: `number` (default: `100`) the delay in milliseconds of all `setTimeout` and `setInterval` callback that get executed is add up. If this the sum is higher then the threshold at the end when reporting an error is throw, otherwise a warning is logged.
- **clearTimers**: `boolean` (default: `true`) whether to clear all timers base on `timerIsolation`


here is an example how the configuration could look like:
```js
export default {
  testEnvironmentOptions: {
    report: {
      console: {
        methods: ["log", "warn", "error"],
        ignore: /Third party message/,
      },
      timers: true,
      fakeTimers: true,
      promises: true,
    },
    delayThreshold: 0,
    timerIsolation: 'afterEach',
    clearTimers: true,
  },
};
```

## Limitations
- it.concurrent is replaced with a sync version
- legacy fake timers are not mocked
- test and hook blocks do not support done callback or generators
- promises that resolve within the next tick can not be tracked for example:
```js
Promise.resolve().then(() => {
  /* i am not tracked as unresolved */
});
```
- injectGlobals must be used, imports from jest can not be mocked, ie import {expect, jest, test} from '@jest/globals';
- console, setTimeout / setInterval can also be imported and will not participate in leak detection is these cases, but this can also serve as exit hatch if needed
```js
import { setTimeout, setInterval } from 'node:timers';
import console from 'node:console';
```

## Recommendations
- use eslint to
  - detect floating promises
  - disallow setTimeout / setInterval in test files
  - disallow console usage
- enable fake timers globally in config (be aware that there might be some issues ie axe needs real timers)
```js
afterEach(async () => {
  jest.useRealTimers();
  await axe();
  jest.useFakeTimers();
});
```

## Tested against
- Jest 28, 29, 30
- node 22, 24

# FAQ

### Why is jest-doctor so strict?
Because flaky tests cost more than broken builds.

### Does this slow tests down?
Slightly. Overhead is intentional and bounded.

### Why does console output fail tests?
It pollutes the console and is often a strong indicator that something is wrong.
Tests should always spy on console and assert on the output.
