import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    // Check if the request path does not start with "/api/"
    if (
      req.url !== '/' &&
      !req.url.startsWith('/docs') &&
      !req.url.startsWith('/api/')
    ) {
      // Redirect to /docs
      res.redirect('/docs');
    } else {
      // Continue to the next middleware or route handler
      next();
    }
  }
}

export const Redirect =
  () => (req: Request, res: Response, next: NextFunction) => {
    const middleware = new RedirectMiddleware();
    middleware.use(req, res, next);
  };
