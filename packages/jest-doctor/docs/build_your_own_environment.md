---
title: Build your own environment
---

# 🛠️ Build your own environment

Out-of-the-box __node__ and __jsdom__ are supported.
If other environments are needed simple use the `createEnvMixin` helper.

Create a new file in your code base and reference it in you jest.config.js as testEnvironment.

```js
import createEnvMixin from 'jest-doctor/createEnvMixin';
import NodeEnvironment from 'jest-environment-node';
import ThirdPartyEnv from 'thrid-party-env';

// eigther wrap the desire existing environment
const JestDoctorThirdPartyEnv = createEnvMixin(ThirdPartyEnv);

// or pass in your own class
class MyEnv extends NodeEnvironment {}
const JestDoctorMyEnv = createEnvMixin(MyEnv);

// or extend from it
class MyEnv extends createEnvMixin(NodeEnvironment) {
  function

  async setup() {
    // dont forget to call super methods
    await super.setup();

    // the actual code
  }
  handleTestEvent = async (event, state) => {
    // super.handleTextEvent not available use instead handleEvent
    // see description below
    await super.handleEvent(event, state);

    // the actual code
  }
}
```

The prototype of JestEnvironment is using an arrow function for handleTestEvent.
This is sub optimal as it can not be called with super.handleTestEvent.
To mitigate this issue jest-doctor introduces a new class property handleEvent which should be called instead.
