/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/await-thenable */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import {
  AuthCredentialsLoginDto,
  AuthCredentialsSignupDto,
} from './dto/auth-credentials.dto';
import { JwtPayload } from 'jsonwebtoken';
import { UserDocument } from 'src/users/schema/users.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsSignupDto,
  ): Promise<void | UserDocument> {
    return this.usersRepository.create(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsLoginDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('please check your login credentials');
    }
  }
}
