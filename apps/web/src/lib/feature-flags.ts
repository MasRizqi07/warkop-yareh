import { isFeatureEnabled } from '@warkop-yareh/types';

export const PUBLIC_ORDERING_ENABLED = isFeatureEnabled('PUBLIC_ORDERING', {
  PUBLIC_ORDERING: process.env.NEXT_PUBLIC_PUBLIC_ORDERING,
});

export const QR_ORDERING_ENABLED = isFeatureEnabled('QR_ORDERING', {
  QR_ORDERING: process.env.NEXT_PUBLIC_QR_ORDERING,
});

export const TABLE_ORDERING_ENABLED = isFeatureEnabled('TABLE_ORDERING', {
  TABLE_ORDERING: process.env.NEXT_PUBLIC_TABLE_ORDERING,
});

export const OPERATIONS_ENABLED = isFeatureEnabled('OPERATIONS', {
  OPERATIONS: process.env.NEXT_PUBLIC_OPERATIONS,
});
