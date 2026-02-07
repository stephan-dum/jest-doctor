# jest-doctor

[![main](https://github.com/stephan-dum/jest-doctor/actions/workflows/main.yml/badge.svg)](https://github.com/stephan-dum/jest-doctor/actions/workflows/main.yml) [![codecov](https://codecov.io/gh/stephan-dum/jest-doctor/branch/main/graph/badge.svg)](https://codecov.io/gh/stephan-dum/jest-doctor) [![npm version](https://img.shields.io/npm/v/jest-doctor.svg)](https://www.npmjs.com/package/jest-doctor) [![License](https://img.shields.io/npm/l/jest-doctor.svg)](https://github.com/stephan-dum/jest-doctor/blob/main/LICENSE)

jest-doctor is a custom Jest environment that detects [async leaks](https://stephan-dum.github.io/jest-doctor/#what-is-an-async-leak) within tests and fails flaky tests deterministically.

## Usage

Out-of-the-box jest-doctor supports node and jsdom environments.
Add one of the environments to your Jest config:

```js
export default {
  testEnvironment: "jest-doctor/env/node",
  // optional
  reporters: ["default", "jest-doctor/reporter"],
};
```

Run your tests as usual and jest-doctor will report leaks such as unresolved promises or timers.

Full documentation, configuration and more:

👉 [https://stephan-dum.github.io/jest-doctor/](https://stephan-dum.github.io/jest-doctor/)

---

If jest-doctor helped you eliminate flaky tests, consider ⭐ starring the repo.

<p align="center">
  <img src="https://stephan-dum.github.io/jest-doctor/assets/img/jest-doctor_mascot.png" alt="jest-doctor mascot" />
</p>
