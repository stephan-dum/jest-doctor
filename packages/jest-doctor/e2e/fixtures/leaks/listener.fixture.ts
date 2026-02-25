it('uses abort controller to unregister event', () => {
  const controller = new AbortController();
  window.addEventListener('message', () => {}, { signal: controller.signal });
  controller.abort();
});
