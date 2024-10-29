import { SetMetadata } from '@nestjs/common';

export const IS_LOGIN_KEY = 'isLogin';
export const Login = () => SetMetadata(IS_LOGIN_KEY, true);
