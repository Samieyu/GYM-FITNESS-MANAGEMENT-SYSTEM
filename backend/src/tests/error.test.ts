import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from '../shared/errors/AppError';

describe('AppError Classes Unit Tests', () => {
  it('instantiates BadRequestError with 400 status', () => {
    const error = new BadRequestError('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.message).toBe('Invalid input');
    expect(error.isOperational).toBe(true);
  });

  it('instantiates UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('instantiates ForbiddenError with 403 status', () => {
    const error = new ForbiddenError('No trainer access');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('instantiates NotFoundError with 404 status', () => {
    const error = new NotFoundError('Member not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('instantiates ConflictError with 409 status', () => {
    const error = new ConflictError('Active membership already exists');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('instantiates UnprocessableEntityError with 422 status and details', () => {
    const details = [{ field: 'email', message: 'Email required' }];
    const error = new UnprocessableEntityError('Validation failed', details);
    expect(error.statusCode).toBe(422);
    expect(error.details).toEqual(details);
  });
});
