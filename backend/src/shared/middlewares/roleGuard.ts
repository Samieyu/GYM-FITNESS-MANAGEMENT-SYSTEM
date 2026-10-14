import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../utils/tokens';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

export const roleGuard = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access forbidden: Requires one of [${allowedRoles.join(', ')}] role(s)`
      );
    }

    next();
  };
};
