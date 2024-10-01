import { HttpException } from '@nestjs/common/exceptions/http.exception';

export class MissingUserError extends Error {
  constructor() {
    super('Fields need an owner to be queried, created or or updated');
  }
}

export class InvalidUserException extends HttpException {
  constructor() {
    super('User is invalid, missing firstname, lastname or email', 422);
  }
}

export class CreatedUserException extends HttpException {
  constructor() {
    super('New user created', 201);
  }
}
