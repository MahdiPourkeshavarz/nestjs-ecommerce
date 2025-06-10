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
    private subcategoryModel: Model<SubCategoryDocument>,
  ) {}

  async create(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryDocument> {
    const newSubCategory = new this.subcategoryModel(createSubCategoryDto);
    await newSubCategory.save();
    return newSubCategory.populate('category');
  }

  async findAll(): Promise<{ subs: SubCategoryDocument[]; total: number }> {
    const subDocs = await this.subcategoryModel
      .find({})
      .populate('category')
      .exec();
    const total = await this.subcategoryModel.countDocuments();
    return {
      subs: subDocs,
      total,
    };
  }

  async findById(id: string): Promise<SubCategoryDocument | null> {
    const subDoc = await this.subcategoryModel.findById(id);
    if (!subDoc) {
      return null;
    }
    return subDoc.populate('category');
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategoryDocument | null> {
    const updatedSubcategory = await this.subcategoryModel
      .findByIdAndUpdate(id, { $set: updateSubCategoryDto }, { new: true })
      .populate(['user', 'products.product']);

    return updatedSubcategory;
  }

  async remove(id: string): Promise<SubCategoryDocument | null> {
    return await this.subcategoryModel
      .findByIdAndDelete(id)
      .populate('category');
  }

  async exists(
    filterQuery: FilterQuery<SubCategoryDocument>,
  ): Promise<boolean> {
    const count = await this.subcategoryModel.countDocuments(filterQuery);
    return count > 0;
  }
}
