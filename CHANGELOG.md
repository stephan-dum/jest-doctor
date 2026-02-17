# CHANGELOG

## 2.0.6

- remove a left over async_hooks

## 2.0.5

- closes [issue#42](https://github.com/stephan-dum/jest-doctor/issues/42) use v8.promiseHooks instead of async_hooks
- fixed an issue where errors would be reported in the next afterEach block

## 2.0.4

- added a stack trace for test/hook timeout error message

## 2.0.3

- fix `subclass` instantiation not complete issue

## 2.0.2

- small documentation fix

## 2.0.1

- added `subclass` mode for promises

## 2.0.0

- docs minor changes + mascot img
- **BREAKING** the option report.promises is now turned off by default due to the big performance impact.
