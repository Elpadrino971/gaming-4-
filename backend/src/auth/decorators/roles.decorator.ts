import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../types/prisma-enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
