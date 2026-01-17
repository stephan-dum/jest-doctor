import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

it('unmounts', () => {
  const MyComponent = () => {
    useEffect(() => {
      const timerId = setTimeout(() => {}, 1000);
      return () => {
        clearTimeout(timerId);
      };
    }, []);

    return <div>hello</div>;
  };
  render(<MyComponent />);
  expect(screen.getByText('hello')).toBeInTheDocument();
});

it('leaks', () => {
  // @ts-expect-error wrong property
  const MyComponent = () => <div wrongProp={'hello'}>hello</div>;
  render(<MyComponent />);
  expect(screen.getByText('hello')).toBeInTheDocument();
});
