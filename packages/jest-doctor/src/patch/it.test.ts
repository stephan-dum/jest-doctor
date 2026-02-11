import patchIt from './it';
import analyzeCallback from '../utils/analyzeCallback';
import { JestDoctorEnvironment, RuntimeGlobals } from '../types';
import { Circus } from '@jest/types';

jest.mock('../utils/analyzeCallback', () => jest.fn());

const itHandler = (testName: Circus.TestName, testHandler: Circus.TestFn) => {
  return (testHandler as () => Promise<unknown>).call({
    testName,
  } as Circus.TestContext);
};

it('should patch on global and run', () => {
  const getStateMock = jest.fn().mockImplementation(() => '');

  const that = {
    global: {
      it: true,
      test: true,
      expect: {
        getState: getStateMock,
      },
    },
  } as unknown as JestDoctorEnvironment;

  const itPatch = jest.fn(itHandler) as jest.Mock & { only: jest.Mock };
  itPatch.only = jest.fn(itHandler);
  const runtimeGlobals = {
    it: itPatch,
  } as unknown as RuntimeGlobals;

  patchIt(that, runtimeGlobals);

  const handler = () => {};
  that.global.it('test name', handler);
  expect(analyzeCallback).toHaveBeenCalledWith(
    that,
    handler,
    {
      testName: 'test name',
    },
    undefined,
    false,
    expect.anything(),
  );
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

  const itPatch = jest.fn(itHandler) as jest.Mock & { only: jest.Mock };
  itPatch.only = jest.fn(itHandler);
  const runtimeGlobals = {
    it: itPatch,
  } as unknown as RuntimeGlobals;

  patchIt(that, runtimeGlobals);

  expect(that.global.it).toEqual(undefined);
});
