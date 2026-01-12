# jest-doctor

**jest-doctor** is a custom Jest environment that **detects async leaks and test isolation bugs**.

It fails tests deterministically when they:

- Leave unresolved Promises
- Leak timers or intervals
- Emit console output

jest-doctor is intentionally strict. If your test leaks async work, that is a bug, even if Jest would normally ignore it.

## Why jest-doctor exists

Jest’s default behavior allows:

- Timers to survive past test boundaries
- Promises to resolve after test completion
- Console output to occur outside test lifecycle

These issues cause:

- Flaky tests
- Order-dependent failures
- Memory leaks in watch mode
- Debugging nightmares

## Installation

```bash
npm install --save-dev jest-doctor
```

## Usage

Simply add one of the provided environments to your `jest.config.js`.

```js
export default {
  testEnvironment: 'jest-doctor/env/node',
};
```

Out of the box node and jsdom are supported. If other environments are needed simple use the createEnvMixin helper.
Simply create a new file in your code base and reference it in you jest.config.js.

```js
import createEnvMixin from 'jest-doctor/createEnvMixin';
import NodeEnvironment from 'jest-environment-node';
import MyEnv from 'my-env';

// eigther wrap the desire existing environment
const JestDoctorMyEnv = createEnvMixin(MyEnv);

// or extend a class and add more functionallity on top
class JestDoctorMyEnv extends createEnvMixin(MyEnv) {
  //...
}
// or pass in your own class
class MyClass extends NodeEnvironment {}
const JestDoctorMyEnv = createEnvMixin(MyClass);

// dont forget to export
export default JestDoctorMyEnv;
```

### Configuration

the environment offers a small set of configuration possibilities threw jest.config.js.
here are the defaults used:

```js
export default {
  testEnvironmentOptions: {
    // control which kind of leaks should be reported
    mock: {
      console: true,
      timers: true, // setTimeout & setInterval
      fakeTimers: true, // setTimeout & setInterval
      promises: true,
    },
    // wheather to clean all timers after ts complites
    clean: true,
  },
};
```

## Limitations

- it.concurrent is replaced with a sync version
- legacy fake timers are not mocked
- it does not support done callback or generators
- promises that resolve within the next tick can not be resolved for example:

```js
Promise.resolve().then(() => {
  /* i am not tracked as unresolved */
});
```

## Recommendations

- use eslint to
  - detect floating promises
  - disallow setTimeout in test files
- enable fake timers globally in config (be aware that there might be some issues ie axe needs real timers)

```js
afterEach(async () => {
  jest.useRealTimers();
  await axe();
  jest.useFakeTimers();
});
```

## Jest version support

Tested against:

- Jest 28, 29, 30
- node 22, 24

# FAQ

### Does this slow tests down?

Slightly mainly because of the usage of async_hook, but overhead is intentional and bounded.

### Why does console output fail tests?

It pollutes the console and is often a strong indicator that something is wrong.
Tests should always spy on console and assert on the output.
