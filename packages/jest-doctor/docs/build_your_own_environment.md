# Build your own environment

Out-of-the-box node and jsdom are supported. If other environments are needed simple use the createEnvMixin helper.
Create a new file in your code base and reference it in you jest.config.js.

```js
import createEnvMixin from 'jest-doctor/createEnvMixin';
import NodeEnvironment from 'jest-environment-node';
import ThirdPartyEnv from 'thrid-party-env';

// eigther wrap the desire existing environment
const JestDoctorThirdPartyEnv = createEnvMixin(ThirdPartyEnv);

// or pass in your own class
class MyEnv extends NodeEnvironment {}
const JestDoctorMyEnv = createEnvMixin(MyEnv);
```
