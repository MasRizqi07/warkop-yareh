import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // If the handler already returned a structured ApiResponse, pass through
        if (response && typeof response === 'object' && 'success' in response) {
          return response as ApiResponse<T>;
        }

        // Extract meta if present (paginated responses)
        const { data, meta, message, ...rest } = (response ?? {}) as {
          data?: T;
          meta?: ApiResponse<T>['meta'];
          message?: string;
          [key: string]: unknown;
        };

        return {
          success: true,
          data:
            data !== undefined
              ? data
              : Object.keys(rest).length
                ? rest
                : response,
          message: message ?? 'Success',
          timestamp: new Date().toISOString(),
          ...(meta ? { meta } : {}),
        };
      }),
    );
  }
}
