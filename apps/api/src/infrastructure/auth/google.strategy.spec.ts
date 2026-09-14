import { UnauthorizedException } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import type { Profile } from 'passport-google-oauth20';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  function createIdTokenPayload(sub: string): Profile['_json'] {
    return {
      iss: 'https://accounts.google.com',
      aud: 'test-google-client',
      sub,
      iat: 1_789_000_000,
      exp: 1_789_003_600,
    };
  }

  beforeEach(() => {
    strategy = new GoogleStrategy();
  });

  it('successfully extracts profile and invokes done callback with user data', () => {
    const mockProfile: Profile = {
      id: 'google-123',
      displayName: 'Ahmad Rizqi',
      emails: [{ value: 'rizqi@example.com', verified: true }],
      photos: [{ value: 'https://example.com/avatar.jpg' }],
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: createIdTokenPayload('google-123'),
    };

    const done = jest.fn();
    strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: 'rizqi@example.com',
      name: 'Ahmad Rizqi',
      avatar: 'https://example.com/avatar.jpg',
    });
  });

  it('falls back to name.givenName or email prefix when displayName is missing', () => {
    const mockProfile: Profile = {
      id: 'google-456',
      displayName: '',
      name: { familyName: '', givenName: 'Rizqi' },
      emails: [{ value: 'barista@yareh.com', verified: true }],
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: createIdTokenPayload('google-456'),
    };

    const done = jest.fn();
    strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: 'barista@yareh.com',
      name: 'Rizqi',
      avatar: undefined,
    });
  });

  it('calls done with UnauthorizedException if Google profile has no verified email', () => {
    const mockProfile: Profile = {
      id: 'google-789',
      displayName: 'No Email User',
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: createIdTokenPayload('google-789'),
    };

    const done = jest.fn();
    strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
  });

  it('rejects an unverified Google email', () => {
    const mockProfile: Profile = {
      id: 'google-unverified',
      displayName: 'Unverified User',
      emails: [{ value: 'unverified@example.com', verified: false }],
      provider: 'google',
      profileUrl: '',
      _raw: '',
      _json: createIdTokenPayload('google-unverified'),
    };
    const done = jest.fn();

    strategy.validate('access-tok', 'refresh-tok', mockProfile, done);

    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
  });
});
