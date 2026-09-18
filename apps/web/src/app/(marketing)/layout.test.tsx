import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MarketingLayout from './layout';

vi.mock('@warkop-yareh/ui', () => ({
  ScrollProgress: () => <div data-testid="scroll-progress" />,
  ScrollToTop: () => <div data-testid="scroll-to-top" />,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <footer>Footer</footer>,
}));

describe('MarketingLayout', () => {
  afterEach(cleanup);

  it('renders marketing content, scroll progress, and footer', () => {
    render(
      <MarketingLayout>
        <p>Marketing content</p>
      </MarketingLayout>
    );

    expect(screen.getByText('Marketing content')).toBeDefined();
    expect(screen.getByTestId('scroll-progress')).toBeDefined();
    expect(screen.getByText('Footer')).toBeDefined();
  });
});
