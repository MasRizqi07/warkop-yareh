import { FEATURE_FLAGS, isFeatureEnabled } from '@warkop-yareh/types';

describe('product feature flags', () => {
  it('defaults every flag off and requires an exact true value', () => {
    for (const flag of FEATURE_FLAGS) {
      expect(isFeatureEnabled(flag, {})).toBe(false);
      expect(isFeatureEnabled(flag, { [flag]: 'TRUE' })).toBe(false);
      expect(isFeatureEnabled(flag, { [flag]: 'true' })).toBe(true);
    }
  });
});
