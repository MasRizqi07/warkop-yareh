import { UnauthorizedException } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import type { Profile } from 'passport-google-oauth20';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  beforeEach(() => {
    strategy = new GoogleStrategy();
  });

  it('successfully extracts profile and invokes done callback with user data', async () => {
    const mockProfile: Profile = {
      id: 'google-123',
      displayName: 'Ahmad Rizqi',
      emails: [{ value: 'rizqi@example.com', verified: true }],
      photos: [{ value: 'https://example.com/avatar.jpg' }],
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: {} as any,
    };

    const done = jest.fn();
    await strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: 'rizqi@example.com',
      name: 'Ahmad Rizqi',
      avatar: 'https://example.com/avatar.jpg',
    });
  });

  it('falls back to name.givenName or email prefix when displayName is missing', async () => {
    const mockProfile: Profile = {
      id: 'google-456',
      displayName: '',
      name: { familyName: '', givenName: 'Rizqi' },
      emails: [{ value: 'barista@yareh.com', verified: true }],
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: {} as any,
    };

    const done = jest.fn();
    await strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: 'barista@yareh.com',
      name: 'Rizqi',
      avatar: undefined,
    });
  });

  it('calls done with UnauthorizedException if Google profile has no email', async () => {
    const mockProfile: Profile = {
      id: 'google-789',
      displayName: 'No Email User',
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: {} as any,
    };

    const done = jest.fn();
    await strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
  });
});
