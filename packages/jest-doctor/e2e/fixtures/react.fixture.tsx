import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

it('unmounts', () => {
  const MyComponent = () => {
    useEffect(() => {
      const timerId = setTimeout(() => {}, 1000);

      const listener = () => {};
      window.addEventListener('resize', listener);
      window.addEventListener('blur', listener, { once: true });

      return () => {
        clearTimeout(timerId);
        window.removeEventListener('resize', listener);
      };
    }, []);

    return <div>hello</div>;
  };

  render(<MyComponent />);

  act(() => {
    window.dispatchEvent(new Event('blur'));
  });

  expect(screen.getByText('hello')).toBeInTheDocument();
});

it('leaks console.error', () => {
  // @ts-expect-error wrong property
  const MyComponent = () => <div wrongProp={'hello'}>hello</div>;
  render(<MyComponent />);
  expect(screen.getByText('hello')).toBeInTheDocument();
});

it('leaks dom listener', () => {
  const MyComponent = () => {
    useEffect(() => {
      const listener = () => {};
      window.addEventListener('resize', listener);
    }, []);

    return <div>hello</div>;
  };
  render(<MyComponent />);
});
