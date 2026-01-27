import { JestDoctorEnvironment, ReportOptions } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';

const patchDOMListeners = (
  that: JestDoctorEnvironment,
  listenerOptions: ReportOptions,
) => {
  const window = that.dom.window;
  const originalWindowAddEventListener = window.addEventListener.bind(window);

  const removeEventLeak = (
    event: string,
    listener: (...args: unknown[]) => void,
    options?: false | AddEventListenerOptions,
  ) => {
    const leak = that.leakRecords.get(that.currentTestName);

    if (leak) {
      const index = leak.domListeners.findLastIndex((record) => {
        const recordCapture =
          typeof record.options === 'object'
            ? record.options.capture
            : record.options;

        const capture = typeof options === 'object' ? options.capture : options;

        return (
          record.event === event &&
          record.listener === listener &&
          recordCapture === capture
        );
      });

      if (index !== -1) {
        leak.domListeners.splice(index, 1);
      }
    }
  };

  window.addEventListener = (
    event: string,
    listener: (...args: unknown[]) => void,
    options?: false | AddEventListenerOptions,
  ) => {
    const leak = that.leakRecords.get(that.currentTestName);

    if (leak) {
      const stack = getStack(window.addEventListener);

      if (!isIgnored(stack, listenerOptions.ignore)) {
        leak.domListeners.push({
          event: event,
          listener,
          stack,
          options,
        });
      }
    }

    if (typeof options === 'object' && options.once) {
      return originalWindowAddEventListener(
        event,
        function (this: Window, ...args) {
          removeEventLeak(event, listener, options);
          listener.call(this, ...args);
        },
        options,
      );
    }
    return originalWindowAddEventListener(event, listener, options);
  };

  const originalWindowRemoveEventListner =
    window.removeEventListener.bind(window);

  window.removeEventListener = (
    event: string,
    listener: (...args: unknown[]) => void,
    options?: false | AddEventListenerOptions,
  ) => {
    removeEventLeak(event, listener, options);
    return originalWindowRemoveEventListner(event, listener, options);
  };
};

export default patchDOMListeners;
