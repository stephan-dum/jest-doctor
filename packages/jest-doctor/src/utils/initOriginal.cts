const initOriginal = () => ({
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  console: {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
    trace: console.trace.bind(console),
  },
});

export default initOriginal;
