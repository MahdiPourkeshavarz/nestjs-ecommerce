/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from './category.repository';
import slugify from 'slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category, CategoryDocument } from './schema/categories.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (!createCategoryDto.slugname && createCategoryDto.name) {
      createCategoryDto.slugname = this.generateSlug(createCategoryDto.name);
    }
    if (
      (await this.categoriesRepository.exists({
        name: createCategoryDto.name,
      })) ||
      (await this.categoriesRepository.exists({
        slugname: createCategoryDto.slugname,
      }))
    ) {
      throw new ConflictException('this category has already been created');
    }

    try {
      const categoryDoc =
        await this.categoriesRepository.create(createCategoryDto);
      return categoryDoc as Category;
    } catch (error) {
      throw new InternalServerErrorException(
        'could not create category',
        error,
      );
    }
  }

  async findAll(): Promise<Category[]> {
    const categoriesDocs: CategoryDocument[] =
      await this.categoriesRepository.findAll();

    return categoriesDocs.map((doc: CategoryDocument) => {
      const plainCategoryObject = doc.toObject();
      return plainCategoryObject as Category;
    });
  }

  async findOneById(id: string): Promise<Category> {
    const categoryDoc = await this.categoriesRepository.findById(id);
    if (!categoryDoc) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return categoryDoc.toObject() as Category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('category not found');
    }
    if (updateCategoryDto.name && !updateCategoryDto.slugname) {
      updateCategoryDto.slugname = this.generateSlug(updateCategoryDto.name);
    } else if (updateCategoryDto.slugname) {
      updateCategoryDto.slugname = this.generateSlug(
        updateCategoryDto.slugname,
      );
    }
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      if (
        await this.categoriesRepository.exists({
          name: updateCategoryDto.name,
          id: { $ne: existingCategory.id },
        })
      ) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists.`,
        );
      }
    }
    if (
      updateCategoryDto.slugname &&
      updateCategoryDto.slugname !== existingCategory.slugname
    ) {
      if (
        await this.categoriesRepository.exists({
          slug: updateCategoryDto.slugname,
          id: { $ne: existingCategory.id },
        })
      ) {
        throw new ConflictException(
          `Category with slug "${updateCategoryDto.slugname}" already exists.`,
        );
      }
    }
    const updatedCategoryDoc = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );
    if (!updatedCategoryDoc) {
      throw new NotFoundException(
        `Category with ID "${id}" not found after update attempt.`,
      );
    }
    return updatedCategoryDoc.toObject() as Category;
  }

  async remove(id: string): Promise<Category> {
    const deletedCategory = await this.categoriesRepository.remove(id);
    if (!deletedCategory) {
      throw new NotFoundException('category not found');
    }
    return deletedCategory.toObject() as Category;
  }
}
