import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (
      !clientId ||
      !clientSecret ||
      clientId.trim() === '' ||
      clientSecret.trim() === ''
    ) {
      throw new ServiceUnavailableException(
        'Google OAuth is not configured on this server',
      );
    }
    return super.canActivate(context);
  }
}
