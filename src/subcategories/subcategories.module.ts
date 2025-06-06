/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { SubCategory, SubCategorySchema } from './schema/subcategories.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategoriesRepository } from './subcategory.repository';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
    CategoriesModule,
  ],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService, SubCategoriesRepository],
  exports: [SubCategoriesService, SubCategoriesRepository],
})
export class SubcategoriesModule {}
