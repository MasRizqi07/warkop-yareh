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

vi.mock('@/components/ai/barista-concierge-modal', () => ({
  BaristaConciergeModal: () => <div>Rekomendasi Barista mounted</div>,
}));

describe('MarketingLayout', () => {
  afterEach(cleanup);

  it('mounts the branch-aware barista recommendation entry point', () => {
    render(
      <MarketingLayout>
        <p>Marketing content</p>
      </MarketingLayout>
    );

    expect(screen.getByText('Marketing content')).toBeDefined();
    expect(screen.getByText('Rekomendasi Barista mounted')).toBeDefined();
  });
});
