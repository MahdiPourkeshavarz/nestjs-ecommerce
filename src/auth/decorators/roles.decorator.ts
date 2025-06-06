/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dto/auth-credentials.dto';

export const ROLES_KEY = 'roles'; // Key for metadata
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
