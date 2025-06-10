/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SubCategoriesRepository } from './subcategory.repository';
import slugify from 'slugify';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { SubCategory } from './schema/subcategories.schema';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { CategoriesRepository } from 'src/categories/category.repository';
import { FindAllResponse } from './models/findAll-response.model';

@Injectable()
export class SubCategoriesService {
  constructor(
    private readonly subcategoriesRepository: SubCategoriesRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  async create(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    const isCategoryExists = await this.categoriesRepository.findById(
      createSubCategoryDto.category,
    );
    if (!isCategoryExists) {
      throw new ConflictException('this category does not exists');
    }

    if (!createSubCategoryDto.slugname && createSubCategoryDto.name) {
      createSubCategoryDto.slugname = this.generateSlug(
        createSubCategoryDto.name,
      );
    }
    if (
      (await this.subcategoriesRepository.exists({
        name: createSubCategoryDto.name,
      })) ||
      (await this.subcategoriesRepository.exists({
        slugname: createSubCategoryDto.slugname,
      }))
    ) {
      throw new ConflictException('this subcategory has already been created');
    }

    try {
      const subcategoryDoc =
        await this.subcategoriesRepository.create(createSubCategoryDto);
      return subcategoryDoc.toObject() as SubCategory;
    } catch (error) {
      throw new InternalServerErrorException(
        'could not register subcategory',
        error,
      );
    }
  }

  async findAll(): Promise<FindAllResponse> {
    const { subs, total } = await this.subcategoriesRepository.findAll();

    const page = 1;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    const sanitizedSubCategories = subs.map((subDoc) => {
      return subDoc.toObject();
    });

    return {
      status: 'success',
      page: Number(page),
      per_page: Number(limit),
      total,
      total_pages: totalPages,
      data: { subcategories: sanitizedSubCategories as SubCategory[] },
    };
  }

  async findOneById(id: string): Promise<SubCategory> {
    const subCategoryDoc = await this.subcategoriesRepository.findById(id);
    if (!subCategoryDoc) {
      throw new NotFoundException(`subcategory with ID "${id}" not found`);
    }
    return subCategoryDoc.toObject() as SubCategory;
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    const existingSubCategory = await this.subcategoriesRepository.findById(id);
    if (!existingSubCategory) {
      throw new NotFoundException('subcategory not found');
    }
    if (updateSubCategoryDto.name && !updateSubCategoryDto.slugname) {
      updateSubCategoryDto.slugname = this.generateSlug(
        updateSubCategoryDto.name,
      );
    } else if (updateSubCategoryDto.slugname) {
      updateSubCategoryDto.slugname = this.generateSlug(
        updateSubCategoryDto.slugname,
      );
    }
    if (
      updateSubCategoryDto.name &&
      updateSubCategoryDto.name !== existingSubCategory.name
    ) {
      if (
        await this.subcategoriesRepository.exists({
          name: updateSubCategoryDto.name,
          id: { $ne: existingSubCategory.id },
        })
      ) {
        throw new ConflictException(
          `Category with name "${updateSubCategoryDto.name}" already exists.`,
        );
      }
    }
    if (
      updateSubCategoryDto.slugname &&
      updateSubCategoryDto.slugname !== existingSubCategory.slugname
    ) {
      if (
        await this.subcategoriesRepository.exists({
          slug: updateSubCategoryDto.slugname,
          id: { $ne: existingSubCategory.id },
        })
      ) {
        throw new ConflictException(
          `subcategory with slug "${updateSubCategoryDto.slugname}" already exists.`,
        );
      }
    }
    const updatedSubCategoryDoc = await this.subcategoriesRepository.update(
      id,
      updateSubCategoryDto,
    );
    if (!updatedSubCategoryDoc) {
      throw new NotFoundException(
        `subcategory with ID "${id}" not found after update attempt.`,
      );
    }
    return updatedSubCategoryDoc.toObject() as SubCategory;
  }

  async remove(id: string): Promise<SubCategory> {
    const deletedSubCategory = await this.subcategoriesRepository.remove(id);
    if (!deletedSubCategory) {
      throw new NotFoundException('subcategory not found');
    }
    return deletedSubCategory.toObject() as SubCategory;
  }
}
