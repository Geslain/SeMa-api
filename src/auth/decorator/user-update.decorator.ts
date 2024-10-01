import { SetMetadata } from '@nestjs/common';

export const IS_USER_UPDATE_KEY = 'isUserUpdate';
export const UserUpdate = () => SetMetadata(IS_USER_UPDATE_KEY, true);
