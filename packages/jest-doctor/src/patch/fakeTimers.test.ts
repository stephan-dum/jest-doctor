import fakeTimers from './fakeTimers';
import { JestDoctorEnvironment } from '../types';

it('should warn if environment does not support fake timers', () => {
  const stderrMock = jest.fn();
  fakeTimers({
    original: {
      stderr: stderrMock,
    },
    fakeTimersModern: {
      _fakeTimers: {},
    },
  } as unknown as JestDoctorEnvironment);

  expect(stderrMock).toHaveBeenCalledWith(
    expect.stringContaining('Fake timers could not be mocked!'),
  );
});
