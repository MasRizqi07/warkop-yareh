import { describe, expect, it } from 'vitest';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';
import {
  branchStructuredData,
  pageMetadata,
  PUBLIC_PATHS,
  serializeJsonLd,
} from './seo';

describe('public search and business truth', () => {
  it('publishes separate outlet identities without attaching Prapen phone to Jetis', () => {
    const [jetis, prapen] = VERIFIED_BRANCHES.map(branchStructuredData);
    expect(jetis).not.toHaveProperty('telephone');
    expect(prapen.telephone).toBe('+6282137354606');
    expect(jetis.address.postalCode).toBe('60243');
    expect(prapen.address.postalCode).toBe('60239');
    for (const business of [jetis, prapen]) {
      for (const key of [
        'acceptsReservations',
        'aggregateRating',
        'geo',
        'email',
        'hasMenu',
        'servesCuisine',
        'priceRange',
      ])
        expect(business).not.toHaveProperty(key);
    }
  });

  it('prevents JSON-LD text from terminating its script element', () => {
    const payload = { name: '</script><script>alert(1)</script>' };
    const serialized = serializeJsonLd(payload);
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it('keeps catalog and login routes out of private search promotion', () => {
    expect(PUBLIC_PATHS).toHaveLength(8);
    expect(PUBLIC_PATHS).not.toContain('/checkout');
    expect(PUBLIC_PATHS).not.toContain('/login');
    expect(
      pageMetadata(
        'Cabang',
        'Alamat',
        '/outlets'
      ).alternates?.canonical?.toString()
    ).toMatch(/\/outlets$/);
  });
});
