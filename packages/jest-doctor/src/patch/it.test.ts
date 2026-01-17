import patchIt from './it';
import analyzeCallback from '../utils/analyzeCallback';
import { JestDoctorEnvironment } from '../types';
import { Circus } from '@jest/types';
import console from 'node:console';
jest.mock('../utils/analyzeCallback', () => jest.fn());
jest.mock('node:console', () => ({
  default: {
    warn: jest.fn(),
  },
  __esModule: true,
}));
it('should', () => {
  const getStateMock = jest.fn().mockImplementation(() => '');
  const itHandler = (testName: Circus.TestName, testHandler: Circus.TestFn) => {
    return (testHandler as () => Promise<unknown>).call({
      testName,
    } as Circus.TestContext);
  };

  const itPatch = jest.fn(itHandler) as jest.Mock & { only: jest.Mock };
  itPatch.only = jest.fn(itHandler);

  const that = {
    global: {
      it: itPatch,
      expect: {
        getState: getStateMock,
      },
    },
  } as unknown as JestDoctorEnvironment;

  patchIt(that);

  const handler = () => {};
  that.global.it('test name', handler);
  expect(analyzeCallback).toHaveBeenCalledWith(that, 'unknown', handler, {
    testName: 'test name',
  });
  expect(itPatch).toHaveBeenCalledTimes(1);
  (analyzeCallback as jest.Mock).mockReset();

  getStateMock.mockImplementation(() => 'test name');
  that.global.test('testName', () => {});
  expect(analyzeCallback).toHaveBeenCalledTimes(1);
  expect(itPatch).toHaveBeenCalledTimes(2);
  (analyzeCallback as jest.Mock).mockReset();

  that.global.it.concurrent('testName', () => Promise.resolve());
  expect(itPatch).toHaveBeenCalledTimes(3);
  expect(analyzeCallback).toHaveBeenCalledTimes(1);
  (analyzeCallback as jest.Mock).mockReset();

  that.global.it.only('testName', () => {});
  expect(itPatch.only).toHaveBeenCalledTimes(1);
  expect(analyzeCallback).toHaveBeenCalledTimes(1);
});

it('should warn if global it is not defined', () => {
  const that = {
    global: {},
  } as JestDoctorEnvironment;
  patchIt(that);
  expect(console.warn).toHaveBeenCalledWith(
    'injectGlobal it is set to false, this will impact on leak detection!',
  );
});
