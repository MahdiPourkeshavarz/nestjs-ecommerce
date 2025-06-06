/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import {
  SubCategory,
  SubCategoryDocument,
} from './schema/subcategories.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubCategoriesRepository {
  constructor(
    @InjectModel(SubCategory.name)
    private categoryModel: Model<SubCategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryDocument> {
    const newCategory = new this.categoryModel(createCategoryDto);
    return await newCategory.save();
  }

  async findAll(): Promise<SubCategoryDocument[]> {
    return await this.categoryModel.find({});
  }

  async findById(id: string): Promise<SubCategoryDocument | null> {
    return await this.categoryModel.findById(id);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategoryDocument | null> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      return null;
    }

    Object.assign(category, updateCategoryDto);
    return await category.save();
  }

  async remove(id: string): Promise<SubCategoryDocument | null> {
    return await this.categoryModel.findByIdAndDelete(id);
  }

  async exists(
    filterQuery: FilterQuery<SubCategoryDocument>,
  ): Promise<boolean> {
    const count = await this.categoryModel.countDocuments(filterQuery);
    return count > 0;
  }
}
