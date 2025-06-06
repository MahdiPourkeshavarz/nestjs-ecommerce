/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { SubCategory, SubCategorySchema } from './schema/subcategories.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SubcategoriesController } from './subcategories.controller';
import { SubCategoriesRepository } from './subcategory.repository';
import { SubCategoriesService } from './subcategories.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [SubcategoriesController],
  providers: [SubCategoriesService, SubCategoriesRepository],
  exports: [SubCategoriesService, SubCategoriesRepository],
})
export class SubcategoriesModule {}
