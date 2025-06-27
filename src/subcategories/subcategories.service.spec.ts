/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesRepository } from './subcategory.repository';
import { CategoriesRepository } from '../categories/category.repository';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const mockSubCategoriesRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
};

const mockCategoryRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
};

const mockCategoryId = 'valid-category-id';
const mockSubcategoryId = 'valid-subcategory-id';

const mockCategory = {
  _id: mockCategoryId,
  name: 'Electronics',
  toObject: () => ({ _id: mockCategoryId, name: 'Electronics' }),
};

const mockCreateDto = {
  name: 'Headphones',
  category: mockCategoryId,
};

const mockSubcategoryDoc = {
  _id: mockSubcategoryId,
  ...mockCreateDto,
  slugname: 'headphones',
  toObject: () => ({
    _id: mockSubcategoryId,
    ...mockCreateDto,
    slugname: 'headphones',
  }),
};

describe('SubcategoriesService', () => {
  let service: SubCategoriesService;
  let subcategoriesRepository;
  let categoriesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubCategoriesService,
        { provide: SubCategoriesRepository, useValue: mockSubCategoriesRepo },
        { provide: CategoriesRepository, useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<SubCategoriesService>(SubCategoriesService);
    subcategoriesRepository = module.get<SubCategoriesRepository>(
      SubCategoriesRepository,
    );
    categoriesRepository =
      module.get<CategoriesRepository>(CategoriesRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a subcategory successfully', async () => {
      categoriesRepository.findById.mockResolvedValue(mockCategory);
      subcategoriesRepository.exists.mockResolvedValue(false);
      subcategoriesRepository.create.mockResolvedValue(mockSubcategoryDoc);

      const result = await service.create(mockCreateDto);

      expect(categoriesRepository.findById).toHaveBeenCalledWith(
        mockCategoryId,
      );
      expect(subcategoriesRepository.exists).toHaveBeenCalledTimes(2);
      expect(subcategoriesRepository.create).toHaveBeenCalledWith({
        ...mockCreateDto,
        slugname: 'headphones',
      });
      expect(result).toEqual(mockSubcategoryDoc.toObject());
    });

    it('should throw ConflictException if parent category does not exist', async () => {
      categoriesRepository.findById.mockResolvedValue(null);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        'this category does not exists',
      );
    });

    it('should throw ConflictException if subcategory name already exists', async () => {
      categoriesRepository.findById.mockResolvedValue(mockCategory);

      subcategoriesRepository.exists.mockResolvedValue(true);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        'this subcategory has already been created',
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      categoriesRepository.findById.mockResolvedValue(mockCategory);
      subcategoriesRepository.exists.mockResolvedValue(false);
      subcategoriesRepository.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneById', () => {
    it('should find and return a subcategory by ID', async () => {
      subcategoriesRepository.findById.mockResolvedValue(mockSubcategoryDoc);

      const result = await service.findOneById(mockSubcategoryId);

      expect(subcategoriesRepository.findById).toHaveBeenCalledWith(
        mockSubcategoryId,
      );
      expect(result).toEqual(mockSubcategoryDoc.toObject());
    });

    it('should throw NotFoundException if subcategory is not found', async () => {
      subcategoriesRepository.findById.mockResolvedValue(null);
      const invalidId = 'invalid-id';

      await expect(service.findOneById(invalidId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneById(invalidId)).rejects.toThrow(
        `subcategory with ID "${invalidId}" not found`,
      );
    });
  });

  describe('update', () => {
    it('should update and return the subcategory', async () => {
      const updateDto = { name: 'Wireless Headphones', category: '' };
      const updatedDoc = {
        ...mockSubcategoryDoc,
        ...updateDto,
        slugname: 'wireless-headphones',
        toObject: () => ({
          ...mockSubcategoryDoc.toObject(),
          ...updateDto,
          slugname: 'wireless-headphones',
        }),
      };
      subcategoriesRepository.findById.mockResolvedValue(mockSubcategoryDoc);
      subcategoriesRepository.exists.mockResolvedValue(false);
      subcategoriesRepository.update.mockResolvedValue(updatedDoc);

      const result = await service.update(mockSubcategoryId, updateDto);

      expect(subcategoriesRepository.findById).toHaveBeenCalledWith(
        mockSubcategoryId,
      );
      expect(subcategoriesRepository.update).toHaveBeenCalledWith(
        mockSubcategoryId,
        { ...updateDto, slugname: 'wireless-headphones' },
      );
      expect(result).toEqual(updatedDoc.toObject());
    });

    it('should throw NotFoundException if the subcategory to update is not found', async () => {
      subcategoriesRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'bitch', category: 'bitch' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if the new name is already taken', async () => {
      const updateDto = { name: 'A different name', category: '' };
      subcategoriesRepository.findById.mockResolvedValue(mockSubcategoryDoc);
      subcategoriesRepository.exists.mockResolvedValue(true);

      await expect(
        service.update(mockSubcategoryId, updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove and return the subcategory', async () => {
      subcategoriesRepository.remove.mockResolvedValue(mockSubcategoryDoc);

      const result = await service.remove(mockSubcategoryId);

      expect(subcategoriesRepository.remove).toHaveBeenCalledWith(
        mockSubcategoryId,
      );
      expect(result).toEqual(mockSubcategoryDoc.toObject());
    });

    it('should throw NotFoundException if the subcategory to remove is not found', async () => {
      subcategoriesRepository.remove.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
