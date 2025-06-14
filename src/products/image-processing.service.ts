/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const thumbnailsPath = join(
      process.cwd(),
      'public/images/products/thumbnail',
    );
    const imagesPath = join(process.cwd(), 'public/images/products/images');
    if (!fs.existsSync(thumbnailsPath)) {
      fs.mkdirSync(thumbnailsPath, { recursive: true });
    }
    if (!fs.existsSync(imagesPath)) {
      fs.mkdirSync(imagesPath, { recursive: true });
    }
  }

  async resizeProductThumbnails(
    productId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) return '';

    const thumbnailFileName = `products-${productId}-${Date.now()}.jpeg`;
    const outputPath = join(
      process.cwd(),
      'public/images/products/thumbnails',
      thumbnailFileName,
    );

    await sharp(file.buffer)
      .resize(1500, 800)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return thumbnailFileName;
  }

  async resizeProductsImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];

    const resizedImages = await Promise.all(
      files.map(async (image, index) => {
        const imageFilename = `products-${productId}-${Date.now()}-${index + 1}.webp`;
        const outputPath = join(
          process.cwd(),
          'public/images/products/images',
          imageFilename,
        );
        await sharp(image.buffer)
          .resize(600, 600, { fit: 'fill' })
          .toFormat('webp')
          .webp({ lossless: true })
          .toFile(outputPath);
        return imageFilename; 
      }),
    );
    return resizedImages;
  }
}
