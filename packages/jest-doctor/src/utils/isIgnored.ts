import type { IsIgnored } from '../types';

const isIgnored = (message: string, ignorePatterns: IsIgnored): boolean => {
  return ignorePatterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return message.includes(pattern);
    }
    return pattern.test(message);
  });
};

export default isIgnored;
