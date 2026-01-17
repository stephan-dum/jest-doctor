import fakeTimers from './fakeTimers';
import console from 'node:console';
import { JestDoctorEnvironment } from '../types';

jest.mock('node:console', () => ({
  default: {
    warn: jest.fn(),
  },
  __esModule: true,
}));

it('should warn if environment does not support fake timers', () => {
  fakeTimers({
    fakeTimersModern: {
      _fakeTimers: {},
    },
  } as unknown as JestDoctorEnvironment);

  expect(console.warn).toHaveBeenCalledWith('Fake timers could not be mocked!');
});
