/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/await-thenable */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsLoginDto, UserRole } from './dto/auth-credentials.dto';
import { User } from 'src/users/schema/users.schema';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(authCredentialsDto: AuthCredentialsLoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    const { username, password } = authCredentialsDto;

    const user = await this.usersService.findByUsername(username);

    if (user && (await user.comparePassword(password))) {
      const payload: JwtPayload = {
        username: user.username,
        role: user.role as UserRole,
        sub: user.id,
      };
      const accessToken: string = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      });

      const refreshTokenPayload = { sub: user.username.toString() };
      const refreshToken: string = this.jwtService.sign(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES_IN',
        ),
      });

      await this.usersService.updateUserRefreshToken(
        user.username.toString(),
        refreshToken,
      );

      const userResponse: Partial<User> = {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      };

      return { accessToken, refreshToken, user: userResponse };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
