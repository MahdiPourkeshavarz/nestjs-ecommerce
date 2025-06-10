/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schema/categories.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const newCategory = new this.categoryModel(createCategoryDto);
    return await newCategory.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return await this.categoryModel.find({});
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return await this.categoryModel.findById(id);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument | null> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: updateCategoryDto },
      { new: true },
    );

    return updatedCategory;
  }

  async remove(id: string): Promise<CategoryDocument | null> {
    return await this.categoryModel.findByIdAndDelete(id);
  }

  async exists(filterQuery: FilterQuery<CategoryDocument>): Promise<boolean> {
    const count = await this.categoryModel.countDocuments(filterQuery);
    return count > 0;
  }
}
