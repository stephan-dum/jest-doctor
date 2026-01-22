import fakeTimers from './fakeTimers';
import { JestDoctorEnvironment } from '../types';

it('should warn if environment does not support fake timers', () => {
  const stderrMock = jest.fn();
  fakeTimers({
    original: {
      stderr: stderrMock,
    },
  } as unknown as JestDoctorEnvironment);

  expect(stderrMock.mock.calls).toEqual(
    expect.arrayContaining([
      [expect.stringContaining('Modern fake timers could not be mocked!')],
      [expect.stringContaining('Legacy fake timers could not be mocked!')],
    ]),
  );
});
