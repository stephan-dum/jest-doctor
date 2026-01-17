import normalizeOptions from './normalizeOptions';

describe('normalize console', () => {
  it('should normalize console if true', () => {
    const result = normalizeOptions({
      report: {
        console: true,
      },
    });

    expect(result.report.console).toEqual({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignore: [],
    });
  });

  it('should normalize console if empty object', () => {
    const result = normalizeOptions({
      report: {
        console: {},
      },
    });

    expect(result.report.console).toEqual({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignore: [],
    });
  });

  it('should normalize console is false', () => {
    const result = normalizeOptions({
      report: {
        console: false,
      },
    });

    expect(result.report.console).toEqual(false);
  });

  it('should normalize console if ignore is an array', () => {
    const result = normalizeOptions({
      report: {
        console: {
          ignore: ['test'],
        },
      },
    });

    expect(result.report.console).toMatchObject({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignore: ['test'],
    });
  });

  it('should normalize console if ignore is a string', () => {
    const result = normalizeOptions({
      report: {
        console: {
          ignore: 'test',
        },
      },
    });

    expect(result.report.console).toMatchObject({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignore: ['test'],
    });
  });
});

it('should normalize if report is undefined', () => {
  const result = normalizeOptions({});

  expect(result).toMatchObject({
    report: {
      timers: 'throw',
    },
    timerIsolation: 'afterEach',
  });
});

describe('normalize promises', () => {
  it('should normalize promises if true', () => {
    const result = normalizeOptions({
      report: {
        promises: true,
      },
    });

    expect(result.report.promises).toEqual({
      onError: 'throw',
      patch: 'async_hooks',
    });
  });

  it('should normalize promises if empty object', () => {
    const result = normalizeOptions({
      report: {
        promises: {},
      },
    });

    expect(result.report.promises).toEqual({
      onError: 'throw',
      patch: 'async_hooks',
    });
  });

  it('should normalize promises is false', () => {
    const result = normalizeOptions({
      report: {
        promises: false,
      },
    });

    expect(result.report.promises).toEqual(false);
  });
});
