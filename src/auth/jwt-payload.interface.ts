/* eslint-disable prettier/prettier */

import { UserRole } from 'src/users/dto/update-user.dto';

export interface JwtPayload {
  role: UserRole;
  username: string;
  sub: string;
}
