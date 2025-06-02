/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthCredentialsLoginDto,
  AuthCredentialsSignupDto,
} from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { UserDocument } from 'src/users/schema/users.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(
    @Body() authCredentialsDto: AuthCredentialsSignupDto,
  ): Promise<void | UserDocument> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signIn')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsLoginDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }
}
