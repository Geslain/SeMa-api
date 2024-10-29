import {
  CallHandler,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { of } from 'rxjs';

import { NotFoundInterceptor } from './not-found.interceptor';

describe('NotFoundInterceptor', () => {
  let interceptor: NotFoundInterceptor;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new NotFoundInterceptor();
    context = {} as ExecutionContext;
    next = {
      handle: jest.fn(),
    };
  });

  it('should pass through if data is defined', (done) => {
    const testData = { message: 'Hello World' };
    next.handle = jest.fn().mockReturnValue(of(testData));

    interceptor.intercept(context, next).subscribe({
      next: (result) => {
        expect(result).toBe(testData);
        done();
      },
    });
  });

  it('should throw NotFoundException if data is null', (done) => {
    next.handle = jest.fn().mockReturnValue(of(null));

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        done();
      },
    });
  });

  it('should throw NotFoundException if data is undefined', (done) => {
    next.handle = jest.fn().mockReturnValue(of(undefined));

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        done();
      },
    });
  });
});
