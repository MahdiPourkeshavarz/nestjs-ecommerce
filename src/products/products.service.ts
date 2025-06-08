/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from './product.repository';
import { CategoriesRepository } from 'src/categories/category.repository';
import { SubCategoriesRepository } from 'src/subcategories/subcategory.repository';
import slugify from 'slugify';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './schema/products.schema';
import { FindAllResponse } from './models/findAll-response.model';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly subcategoriesRepository: SubCategoriesRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly productRepository: ProductsRepository,
  ) {}

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (
      !(await this.categoriesRepository.findById(createProductDto.category))
    ) {
      throw new NotFoundException(
        `category with ID "${createProductDto.category}" not found`,
      );
    } else if (
      !(await this.subcategoriesRepository.findById(
        createProductDto.subcategory,
      ))
    ) {
      throw new NotFoundException(
        `subcategory with ID "${createProductDto.subcategory}" not found`,
      );
    }

    if (!createProductDto.slugname && createProductDto.name) {
      createProductDto.slugname = this.generateSlug(createProductDto.name);
    }
    if (
      (await this.productRepository.exists({
        name: createProductDto.name,
      })) ||
      (await this.productRepository.exists({
        slugname: createProductDto.slugname,
      }))
    ) {
      throw new ConflictException('this product has already been created');
    }

    try {
      const productDoc = await this.productRepository.create(createProductDto);
      return productDoc.toObject() as Product;
    } catch (error) {
      throw new InternalServerErrorException('could not create product', error);
    }
  }

  async findAll(): Promise<FindAllResponse> {
    const { products, total } = await this.productRepository.findAll();

    const page = 1;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    const sanitizedProducts = products.map((product) => {
      return product.toObject();
    });

    return {
      status: 'success',
      page: Number(page),
      per_page: Number(limit),
      total,
      total_pages: totalPages,
      data: { products: sanitizedProducts as Product[] },
    };
  }

  async findOneById(id: string): Promise<Product> {
    const ProductDoc = await this.productRepository.findById(id);
    if (!ProductDoc) {
      throw new NotFoundException(`product with ID "${id}" not found`);
    }
    return ProductDoc.toObject() as Product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('product not found');
    }
    if (updateProductDto.name && !updateProductDto.slugname) {
      updateProductDto.slugname = this.generateSlug(updateProductDto.name);
    } else if (updateProductDto.slugname) {
      updateProductDto.slugname = this.generateSlug(updateProductDto.slugname);
    }
    if (
      updateProductDto.name &&
      updateProductDto.name !== existingProduct.name
    ) {
      if (
        await this.productRepository.exists({
          name: updateProductDto.name,
          id: { $ne: existingProduct.id },
        })
      ) {
        throw new ConflictException(
          `product with name "${updateProductDto.name}" already exists.`,
        );
      }
    }
    if (
      updateProductDto.slugname &&
      updateProductDto.slugname !== existingProduct.slugname
    ) {
      if (
        await this.productRepository.exists({
          slug: updateProductDto.slugname,
          id: { $ne: existingProduct.id },
        })
      ) {
        throw new ConflictException(
          `products with slug "${updateProductDto.slugname}" already exists.`,
        );
      }
    }
    const updatedProductDoc = await this.productRepository.update(
      id,
      updateProductDto,
    );
    if (!updatedProductDoc) {
      throw new NotFoundException(
        `product with ID "${id}" not found after update attempt.`,
      );
    }
    return updatedProductDoc.toObject() as Product;
  }

  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productRepository.remove(id);
    if (!deletedProduct) {
      throw new NotFoundException('product not found');
    }
    return deletedProduct.toObject() as Product;
  }
}
