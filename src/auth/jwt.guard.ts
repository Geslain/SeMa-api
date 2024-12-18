import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { InvalidUserException } from '../common/errors';

import { IS_LOGIN_KEY } from './decorator/is-login.decorator';
import { IS_USER_UPDATE_KEY } from './decorator/user-update.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
  ) {
    super();
  }

  private logger = new Logger('JwtGuard');

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    if (!user) {
      this.logger.error(
        'JwtGuard::handleRequest',
        info,
        context.switchToHttp().getRequest().headers.authorization,
      );
    }
    return super.handleRequest(err, user, info, context, status);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isLogin = this.reflector.getAllAndOverride<boolean>(IS_LOGIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isUserUpdate = this.reflector.getAllAndOverride<boolean>(
      IS_USER_UPDATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const baseGuardResult = await super.canActivate(context);
    const request = context.switchToHttp().getRequest();

    request.user.username = request.user['https://sema.com'];

    if (isLogin) {
      return !!baseGuardResult;
    }

    const user = await this.userService.findOneByEmail(request.user.username);

    if (!user) return false;

    if (!user.isValid() && !isUserUpdate) {
      throw new InvalidUserException();
    }

    return !!baseGuardResult;
  }
}
