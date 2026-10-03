import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requestCorrelation: RequestHandler = (request, response, next) => {
  const supplied = request.get('x-request-id');
  const requestId =
    supplied && /^[a-zA-Z0-9._-]{1,64}$/.test(supplied)
      ? supplied
      : randomUUID();
  response.setHeader('X-Request-Id', requestId);
  next();
};
