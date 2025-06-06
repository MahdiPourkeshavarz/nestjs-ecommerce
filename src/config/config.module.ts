/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import configuration from './configuration';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env`,

      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().default('3600s'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().default('7d'),
        ADMIN_USERNAME: Joi.string().default('superadmin'),
        ADMIN_PASSWORD: Joi.string().default('SuperSecurePassword123!'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class ConfigModule {}
