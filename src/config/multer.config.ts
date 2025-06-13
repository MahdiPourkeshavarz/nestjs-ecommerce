/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { HttpException, HttpStatus } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { extname } from 'path';

export const multerOption = {
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `unsupported file type ${extname(file.originalName)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  storage: memoryStorage(),
};
