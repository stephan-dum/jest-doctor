---
title: Examples
sitemap: false
---
# 🙈 Examples

This page illustrates some examples that would fail the test with jest-doctor and how to fix them.

## ⏱️ Timers

Timers frequently cause flaky or hanging tests in large codebases.

In this example, a setInterval remains active after the test completes,
preventing the process from exiting naturally.
Jest will force termination, but the root cause remains hidden.
```js
const doSomething = jest.fn();

it('will run but never stop', async () => {
  setInterval(() =>{ doSomething() } , 100);
  await waitFor(() => expect(doSomething).toHaveBeenCalled());
});
```

To fix the issue:
- use fake timers
- run pending timers
- clear timers when test is complete

```js
const doSomething = jest.fn();

it('will run but never stop', async () => {
  jest.useFakeTimers()
  setInterval(() =>{ doSomething() } , 100);
  jest.runOnlyPendingTimers();
  expect(doSomething).toHaveBeenCalled();
  jest.clearAllTimers();
});
```

It is important to call `jest.clearAllTimers` because otherwise the next test could also execute the setInterval by advancing timers.
This can be also done in a `afterEach` block if there are more tests.

## 🃏 Fake Timers

Fake timers are useful but can leak if timers from one test affect another.

```js
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const mock = jest.fn();

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllMocks();
})

it('should not fire immediatly', () => {
  const debouncer = debounce(mock, 100);
  debouncer();
  expect(mock).not.toHaveBeenCalled();
});

it('should fire once timeout complete', () => {
  const debouncer = debounce(mock, 100);
  debouncer();
  jest.runOnlyPendingTimers();
  expect(mock).toHaveBeenCalledTimes(1);
});
```

The second test will fail because the timeout of the first test is still pending and will also fire.

To fix it run `jest.clearAllTimers` in `afterEach` hook.
```js
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
})
```

## ⏳ Promises

Not awaiting promises can cause unpredictable timing and flaky tests.

```js
const mutateGlobalState = async () => {
  localStorage.setItem('status', 'pending');
  await doSomething();
  localStorage.setItem('status', 'done');
};

beforeEach(() => {
  localStorage.removeItem('status');
})

it('should have awaited the promise', () => {
  // ups forgot to await the promise
  mutateGlobalState();
  expect(localStorage.getItem('status')).toEqual('pending')
})
```

Now it is not clear at which point in time the promise will resolve and set the value which can result in flaky tests.

To fix it simply `await` the function.
```js
it('awaits the promise', async () => {
  await mutateGlobalState();
  expect(localStorage.getItem('status')).toEqual('pending')
})
```

## 🖨️ Console Output

Unexpected console warnings or errors may indicate hidden issues.

```js
import { render, screen } from '@testing-library/react';

it('leaks console.error', () => {
  const MyComponent = () => <div wrongProp={'hello'}>hello</div>;
  render(<MyComponent />);
  expect(screen.getByText('hello')).toBeInTheDocument();
});
```

React logs an error due to an invalid prop, but the test still passes, hiding the issue.

## 👂 Window listener

Adding global listeners without a cleanup can leak state or throw errors in later tests.

```js
import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

const calculateViewport = () => {
  const width = window.innerWidth;
  if (width < 600) return 'sm';
  if (width < 1200) return 'm';
  return 'xl';
};

const useViewport = () => {
  const [viewport, setViewport] = useState('sm')

  useEffect(() => {
    window.addEventListener('resize', () => {
      setViewport(calculateViewport());
    })
  }, []);

  return viewport;
}

it('should set the viewport on window changes', () => {
  const { result } = renderHook(useViewport);

  expect(result.current).toEqual('sm');

  act(() => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  });

  expect(result.current).toEqual('m');
});
```

To fix the issue, simple return a cleanup function inside `useEffect`:

```js
useEffect(() => {
  const handler = (event) => {
    setViewport(calculateViewport(event));
  };

  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);
```

Usually rule of thumb if you are using a `useEffect` there should be a cleanup function, there are only some rare exceptions to it.
Most `useEffect` can be converted to `useMemo`

## 📌 Conclusion
- use fake timers
- clear timers after each test
- be careful when mutating global/shared states
- use eslint with typescript to detect floating promises
- spy on console and assert on it
- clear all listeners / timeouts in a useEffect
