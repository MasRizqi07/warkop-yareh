import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PwaRegister } from './PwaRegister';

describe('PwaRegister', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(
    navigator,
    'serviceWorker'
  );

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    } else {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
  });

  it('registers immediately when the document is already loaded', async () => {
    const register = vi
      .fn<() => Promise<ServiceWorkerRegistration>>()
      .mockResolvedValue({} as ServiceWorkerRegistration);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');

    render(<PwaRegister />);

    await waitFor(() => expect(register).toHaveBeenCalledWith('/sw.js'));
  });

  it('removes a pending load listener when the component unmounts', () => {
    const register = vi.fn<() => Promise<ServiceWorkerRegistration>>();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');

    const rendered = render(<PwaRegister />);
    const loadRegistration = addListener.mock.calls.find(
      ([eventName]) => eventName === 'load'
    );
    expect(loadRegistration).toBeDefined();

    rendered.unmount();

    expect(removeListener).toHaveBeenCalledWith('load', loadRegistration?.[1]);
    expect(register).not.toHaveBeenCalled();
  });
});
