/*import { render } from '@testing-library/react';
import { useEffect } from 'react';
import { setTimeout } from 'node:timers';

it.skip('runs a test', () => {
  const MyComponent = () => {
    useEffect(() => {
      window.addEventListener('resize', () => {});
    }, []);
    return <div>Hello World</div>;
  };

  render(<MyComponent />);
});*/

it('leaks a promise', () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
});
