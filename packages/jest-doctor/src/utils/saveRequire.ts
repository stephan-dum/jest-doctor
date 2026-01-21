import { type JestDoctorConstructor } from '../createEnvMixin';
const saveRequire = (envName: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require(envName) as { default: JestDoctorConstructor }).default;
  } catch (error) {
    throw new Error(`${envName} needs to be installed as a peer dependency`, {
      cause: error,
    });
  }
};

export default saveRequire;
