import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * PRD-compliant error response format:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "MENU_ITEM_NOT_FOUND",
 *     "message": "Menu item not found",
 *     "details": null | ValidationError[]
 *   },
 *   "timestamp": "2026-06-01T10:00:00.000Z"
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = this.deriveErrorCode(status, res);
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        // NestJS validation pipe returns { message: string[] }
        const rawMessage = resObj['message'];
        if (Array.isArray(rawMessage)) {
          message = 'Validation failed';
          details = rawMessage;
          code = 'VALIDATION_ERROR';
        } else {
          message = typeof rawMessage === 'string' ? rawMessage : message;
          code =
            typeof resObj['code'] === 'string'
              ? resObj['code']
              : this.deriveErrorCode(status, message);
          details = resObj['details'] ?? null;
        }
      }
    } else if (exception instanceof Error) {
      // Never expose stack traces or internal messages to clients
      this.logger.error(
        `[${request.method}] ${request.url} — Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception type:', exception);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  private deriveErrorCode(status: number, message: string): string {
    const messageCode = message
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    if (messageCode && messageCode.length <= 50) return messageCode;

    const statusCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      503: 'SERVICE_UNAVAILABLE',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return statusCodes[status] ?? 'UNKNOWN_ERROR';
  }
}
