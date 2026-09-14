import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

import type { ComponentPropsWithoutRef } from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: ComponentPropsWithoutRef<'div'>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('LoginPage', () => {
  it('renders Google sign-in button linking to the backend OAuth endpoint', () => {
    render(<LoginPage />);

    const googleBtns = screen.getAllByRole('button', { name: /Masuk dengan Google/i });
    expect(googleBtns.length).toBeGreaterThan(0);

    const googleLink = document.getElementById('google-login-button');
    expect(googleLink).toBeDefined();
    expect(googleLink?.getAttribute('href')).toMatch(/\/auth\/google$/);
  });

  it('renders standard email & password form controls and OTP option', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/Email address/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Email Magic Link \(OTP\)/i }).length).toBeGreaterThan(0);
  });
});
