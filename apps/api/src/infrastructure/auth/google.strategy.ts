import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'disabled_google_client_id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || 'disabled_google_client_secret',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:4000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException('Google account does not provide an email'),
        false,
      );
    }
    const user = {
      email,
      name:
        profile.displayName || profile.name?.givenName || email.split('@')[0],
      avatar: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
