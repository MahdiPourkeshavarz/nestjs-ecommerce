/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './category.repository';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const mockCategoriesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
};

const categoryId = 'CategoryId';
const categoryId2 = 'CategoryId2';

const createCategoryDto = {
  name: 'newCategory',
};

const updateCategoryDto = {
  name: 'newName',
};

const plainCreatedCategory = {
  id: categoryId,
  name: 'newCategory',
  slugname: 'newcategory',
  icon: 'img.jpg',
};

const createdCategory = {
  ...plainCreatedCategory,
  toObject: () => plainCreatedCategory,
};

const plainAnotherCreatedCategory = {
  id: categoryId2,
  name: 'newCategory2',
  slugname: 'newcategory2',
  icon: 'img3.jpg',
};

const anotherCreatedCategory = {
  ...plainAnotherCreatedCategory,
  toObject: () => plainAnotherCreatedCategory,
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository =
      module.get<CategoriesRepository>(CategoriesRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a category successfully', async () => {
      categoriesRepository.exists.mockResolvedValue(false);
      categoriesRepository.create.mockResolvedValue(createdCategory);

      const result = await service.create(createCategoryDto);

      expect(categoriesRepository.exists).toHaveBeenCalledTimes(2);
      expect(categoriesRepository.create).toHaveBeenCalledWith({
        name: 'newCategory',
        slugname: 'newcategory',
      });
      expect(result).toEqual(plainCreatedCategory);
    });

    it('should throw ConflictException if category name already exists', async () => {
      categoriesRepository.exists.mockResolvedValue(true);

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if repository create fails', async () => {
      categoriesRepository.exists.mockResolvedValue(false);
      categoriesRepository.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of categories', async () => {
      const repoResponse = {
        categories: [createdCategory, anotherCreatedCategory],
        total: 2,
      };
      categoriesRepository.findAll.mockResolvedValue(repoResponse);

      const result = await service.findAll();

      expect(categoriesRepository.findAll).toHaveBeenCalled();
      expect(result.total).toBe(2);
      expect(result.data.categories.length).toBe(2);
      expect(result.data.categories[0]).toEqual(plainCreatedCategory);
    });
  });

  describe('findOneById', () => {
    it('should return a single category if found', async () => {
      categoriesRepository.findById.mockResolvedValue(createdCategory);

      const result = await service.findOneById(categoryId);

      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(plainCreatedCategory);
    });

    it('should throw NotFoundException if category is not found', async () => {
      categoriesRepository.findById.mockResolvedValue(null);

      await expect(service.findOneById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the category successfully', async () => {
      const updatedDoc = {
        ...createdCategory,
        name: 'newName',
        toObject: () => ({ ...plainCreatedCategory, name: 'newName' }),
      };
      categoriesRepository.findById.mockResolvedValue(createdCategory);
      categoriesRepository.exists.mockResolvedValue(false);
      categoriesRepository.update.mockResolvedValue(updatedDoc);

      const result = await service.update(categoryId, updateCategoryDto);

      expect(categoriesRepository.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
      );
      expect(result.name).toEqual('newName');
    });

    it('should throw NotFoundException if the category to update is not found', async () => {
      categoriesRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return the category successfully', async () => {
      categoriesRepository.remove.mockResolvedValue(createdCategory);

      const result = await service.remove(categoryId);

      expect(categoriesRepository.remove).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(plainCreatedCategory);
    });

    it('should throw NotFoundException if the category to remove is not found', async () => {
      categoriesRepository.remove.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
