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
import {
  SubCategory,
  SubCategoryDocument,
} from './schema/subcategories.schema';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubCategoriesService {
  constructor(
    private readonly subcategoriesRepository: SubCategoriesRepository,
  ) {}

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  async create(createCategoryDto: CreateSubCategoryDto): Promise<SubCategory> {
    if (!createCategoryDto.slugname && createCategoryDto.name) {
      createCategoryDto.slugname = this.generateSlug(createCategoryDto.name);
    }
    if (
      (await this.subcategoriesRepository.exists({
        name: createCategoryDto.name,
      })) ||
      (await this.subcategoriesRepository.exists({
        slugname: createCategoryDto.slugname,
      }))
    ) {
      throw new ConflictException('this category has already been created');
    }

    try {
      const categoryDoc =
        await this.subcategoriesRepository.create(createCategoryDto);
      return categoryDoc.toObject() as SubCategory;
    } catch (error) {
      throw new InternalServerErrorException(
        'could not create category',
        error,
      );
    }
  }

  async findAll(): Promise<SubCategory[]> {
    const subcategoriesDocs: SubCategoryDocument[] =
      await this.subcategoriesRepository.findAll();

    return subcategoriesDocs.map((doc: SubCategoryDocument) => {
      const plainCategoryObject = doc.toObject();
      return plainCategoryObject as SubCategory;
    });
  }

  async findOneById(id: string): Promise<SubCategory> {
    const categoryDoc = await this.subcategoriesRepository.findById(id);
    if (!categoryDoc) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return categoryDoc.toObject() as SubCategory;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    const existingCategory = await this.subcategoriesRepository.findById(id);
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
        await this.subcategoriesRepository.exists({
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
        await this.subcategoriesRepository.exists({
          slug: updateCategoryDto.slugname,
          id: { $ne: existingCategory.id },
        })
      ) {
        throw new ConflictException(
          `Category with slug "${updateCategoryDto.slugname}" already exists.`,
        );
      }
    }
    const updatedCategoryDoc = await this.subcategoriesRepository.update(
      id,
      updateCategoryDto,
    );
    if (!updatedCategoryDoc) {
      throw new NotFoundException(
        `Category with ID "${id}" not found after update attempt.`,
      );
    }
    return updatedCategoryDoc.toObject() as SubCategory;
  }

  async remove(id: string): Promise<SubCategory> {
    const deletedCategory = await this.subcategoriesRepository.remove(id);
    if (!deletedCategory) {
      throw new NotFoundException('category not found');
    }
    return deletedCategory.toObject() as SubCategory;
  }
}
