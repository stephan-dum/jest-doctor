import { render } from '@testing-library/react';
import { useEffect } from 'react';

it('runs a test', () => {
  const MyComponent = () => {
    useEffect(() => {
      window.addEventListener('resize', () => {});
    }, []);
    return <div>Hello World</div>;
  };

  render(<MyComponent />);
});
