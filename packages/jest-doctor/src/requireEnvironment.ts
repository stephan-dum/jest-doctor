import createEnvMixin, { type JestDoctorConstructor } from './createEnvMixin';
const requireEnvironment = (envName: string) => {
  try {
    const JsdomEnvironment =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require(envName) as { default: JestDoctorConstructor }).default;

    return createEnvMixin(JsdomEnvironment);
  } catch (error) {
    throw new Error(`${envName} needs to be installed as a peer dependency`, {
      cause: error,
    });
  }
};

export default requireEnvironment;
