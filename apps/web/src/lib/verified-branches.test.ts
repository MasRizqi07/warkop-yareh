import { describe, it, expect } from 'vitest';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';

describe('VERIFIED_BRANCHES canonical domain invariants', () => {
  it('contains exactly 2 verified physical branches', () => {
    expect(VERIFIED_BRANCHES).toHaveLength(2);
    const branchIds = VERIFIED_BRANCHES.map((b) => b.id);
    expect(branchIds).toEqual(['jetis-kulon', 'prapen']);
  });

  it('verifies Jetis Kulon branch canonical data', () => {
    const jetis = VERIFIED_BRANCHES.find((b) => b.id === 'jetis-kulon');
    expect(jetis).toBeDefined();
    expect(jetis?.slug).toBe('jetis-kulon');
    expect(jetis?.name).toBe("WARKOP YA'REH");
    expect(jetis?.brandName).toBe("Warkop Ya'reh");
    expect(jetis?.address.street).toBe('Jl. Raya Jetis Kulon I No.38');
    expect(jetis?.address.subdistrict).toBe('Wonokromo');
    expect(jetis?.address.district).toBe('Kec. Wonokromo');
    expect(jetis?.address.city).toBe('Surabaya');
    expect(jetis?.address.province).toBe('Jawa Timur');
    expect(jetis?.address.postalCode).toBe('60243');
    expect(jetis?.plusCode).toBe('MPVJ+2G Wonokromo, Surabaya, Jawa Timur');
    expect(jetis?.phone).toBeNull();
    expect(jetis?.operatingHours).toBe('24 Hours');
    expect(jetis?.isMainBranch).toBe(true);
    expect(jetis?.confidence).toBe('VERIFIED');
  });

  it('verifies Prapen branch canonical data', () => {
    const prapen = VERIFIED_BRANCHES.find((b) => b.id === 'prapen');
    expect(prapen).toBeDefined();
    expect(prapen?.slug).toBe('prapen');
    expect(prapen?.name).toBe("WARKOP YA'REH 2 PRAPEN");
    expect(prapen?.brandName).toBe("Warkop Ya'reh");
    expect(prapen?.address.street).toBe('Jl. Raya Prapen No.39');
    expect(prapen?.address.subdistrict).toBe('Prapen');
    expect(prapen?.address.district).toBe('Kec. Tenggilis Mejoyo');
    expect(prapen?.address.city).toBe('Surabaya');
    expect(prapen?.address.province).toBe('Jawa Timur');
    expect(prapen?.address.postalCode).toBe('60239');
    expect(prapen?.plusCode).toBe('MQM3+XJ Prapen, Surabaya, Jawa Timur');
    expect(prapen?.phone).toBe('0821-3735-4606');
    expect(prapen?.operatingHours).toBe('24 Hours');
    expect(prapen?.isMainBranch).toBe(false);
    expect(prapen?.confidence).toBe('VERIFIED');
  });

  it('rejects legacy incorrect addresses and speculative Plus Codes', () => {
    for (const branch of VERIFIED_BRANCHES) {
      expect(branch.plusCode).not.toContain('JP7J+54');
      expect(branch.plusCode).not.toContain('HMQF+XX');
      expect(branch.address.street).not.toContain('37A');
      expect(branch.address.street).not.toContain('Prapen Indah');
      expect(branch.name).not.toContain('Cold');
      expect(branch.id).not.toContain('gubeng');
      expect(branch.id).not.toContain('darmo');
    }
  });
});

