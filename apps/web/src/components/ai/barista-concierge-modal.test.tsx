import type { ComponentProps, ReactNode } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BaristaConciergeModal } from './barista-concierge-modal';

const mocks = vi.hoisted(() => ({
  activeBranch: { id: 'branch-1' } as { id: string } | null,
  branchError: false,
  addItem: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...props
    }: ComponentProps<'div'> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => {
      void _initial;
      void _animate;
      void _exit;
      void _transition;
      return <div {...props}>{children}</div>;
    },
  },
}));

vi.mock('@/stores', () => ({
  useCartStore: () => ({ addItem: mocks.addItem }),
}));

vi.mock('@/features/catalog/catalog.hooks', () => ({
  useActiveBranch: () => ({
    activeBranch: mocks.activeBranch,
    isError: mocks.branchError,
  }),
  useCatalog: () => ({
    data: {
      products: [
        {
          id: 'coffee-1',
          name: 'Kopi Cabang Satu',
          price: 25_000,
        },
      ],
    },
  }),
}));

describe('BaristaConciergeModal', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.activeBranch = { id: 'branch-1' };
    mocks.branchError = false;
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/ai/barista-chat')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { reply: 'Coba Kopi Cabang Satu.' },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            highlightedProducts: [
              {
                id: 'coffee-1',
                name: 'Kopi Cabang Satu',
                price: 25_000,
                description: 'Kopi dari katalog cabang aktif.',
                flavorNotes: ['bold'],
                pairingReason: 'Cocok dengan preferensi.',
              },
            ],
          },
        }),
      };
    });
  });

  it('uses honest customer-facing copy and scopes both requests to the active branch', async () => {
    render(<BaristaConciergeModal />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Buka Rekomendasi Barista' })
    );
    expect(
      screen.getByRole('heading', { name: /Rekomendasi Barista/ })
    ).toBeDefined();
    expect(screen.queryByText(/Barista AI|AI Concierge/i)).toBeNull();

    fireEvent.change(screen.getByPlaceholderText(/Ketik selera kopimu/), {
      target: { value: 'kopi bold' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim pesan' }));

    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(2));
    const requestBodies = mocks.fetch.mock.calls.map(([, init]) =>
      JSON.parse(String((init as RequestInit).body))
    );
    expect(requestBodies).toEqual([
      { message: 'kopi bold', branchId: 'branch-1' },
      { userQuery: 'kopi bold', branchId: 'branch-1' },
    ]);
    expect(await screen.findByText('Coba Kopi Cabang Satu.')).toBeDefined();
  });

  it('shows a handled branch state and sends no request without an active branch', () => {
    mocks.activeBranch = null;

    render(<BaristaConciergeModal />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Buka Rekomendasi Barista' })
    );

    expect(screen.getByRole('status').textContent).toContain(
      'Menyiapkan cabang'
    );
    expect(
      screen
        .getByRole('button', { name: 'Kirim pesan' })
        .hasAttribute('disabled')
    ).toBe(true);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
