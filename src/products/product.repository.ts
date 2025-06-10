/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schema/products.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const newProduct = new this.productModel(createProductDto);
    await newProduct.save();
    return await newProduct.populate(['category', 'subcategory']);
  }

  async findAll(): Promise<{ products: ProductDocument[]; total: number }> {
    const products = await this.productModel
      .find({})
      .populate(['category', 'subcategory'])
      .exec();
    const total = await this.productModel.countDocuments();
    return {
      products,
      total,
    };
  }

  async findById(id: string): Promise<ProductDocument | null> {
    const product = await this.productModel.findById(id);
    if (!product) {
      return null;
    }
    return await product.populate(['category', 'subcategory']);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument | null> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { $set: updateProductDto }, { new: true })
      .populate(['category', 'subcategory']);

    return updatedProduct;
  }

  async remove(id: string): Promise<ProductDocument | null> {
    return await this.productModel
      .findByIdAndDelete(id)
      .populate(['category', 'subcategory']);
  }

  async exists(filterQuery: FilterQuery<ProductDocument>): Promise<boolean> {
    const count = await this.productModel.countDocuments(filterQuery);
    return count > 0;
  }
}
