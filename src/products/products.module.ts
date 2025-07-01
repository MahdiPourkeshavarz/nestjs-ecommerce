/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/products.schema';
import { ProductsRepository } from './product.repository';
import { CategoriesModule } from 'src/categories/categories.module';
import { SubcategoriesModule } from 'src/subcategories/subcategories.module';
import { ImageProcessingService } from './image-processing.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerOption } from 'src/config/multer.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoriesModule,
    SubcategoriesModule,
    MulterModule.register(multerOption),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ImageProcessingService],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
