/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { SubCategoriesController } from './subcategories.controller';
import { SubCategoriesService } from './subcategories.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

const mockSubCategoriesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SubcategoriesController', () => {
  let controller: SubCategoriesController;
  let service: SubCategoriesService;

  const mockCategoryId = 'someID';

  const mockSubcategoryDto = {
    category: mockCategoryId,
    name: 'headphone',
  };

  const mockCreatedSubcategory = {
    id: 'someSubId',
    slugname: 'headphone',
    ...mockSubcategoryDto,
  };

  const mockAnotherSubcategory = {
    _id: 'anotherSubId',
    name: 'earbuds',
    slugname: 'earbuds',
    category: mockCategoryId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubCategoriesController],
      providers: [
        {
          provide: SubCategoriesService,
          useValue: mockSubCategoriesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SubCategoriesController>(SubCategoriesController);
    service = module.get<SubCategoriesService>(SubCategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create method in service and return result', async () => {
      mockSubCategoriesService.create.mockResolvedValue(mockCreatedSubcategory);

      const res = await controller.create(mockSubcategoryDto);

      expect(service.create).toHaveBeenCalled();
      expect(res).toEqual({
        data: {
          subcategory: mockCreatedSubcategory,
        },
        status: 'success',
      });
    });
    it('should call create method in service and handle errors', async () => {
      const wrongSubcategoryDto = {
        category: 'wrongID',
        name: 'gholam',
      };
      const errorMessage = 'this subcategory has already been created';
      mockSubCategoriesService.create.mockRejectedValue(
        new ConflictException(errorMessage),
      );

      await expect(controller.create(wrongSubcategoryDto)).rejects.toThrow(
        ConflictException,
      );

      await expect(controller.create(wrongSubcategoryDto)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('findAll', () => {
    it('should return all subcategories wrapped in a data object', async () => {
      const subcategoriesList = {
        subcategories: [mockCreatedSubcategory, mockAnotherSubcategory],
      };
      mockSubCategoriesService.findAll.mockResolvedValue(subcategoriesList);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        status: 'success',
        data: { subcategories: subcategoriesList },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single subcategory if a valid ID is provided', async () => {
      const subcategoryId = 'someSubId';
      mockSubCategoriesService.findOneById.mockResolvedValue(
        mockCreatedSubcategory,
      );

      const result = await controller.findOne(subcategoryId);

      expect(service.findOneById).toHaveBeenCalledWith(subcategoryId);
      expect(result).toEqual({
        status: 'success',
        data: { subcategory: mockCreatedSubcategory },
      });
    });

    it('should throw NotFoundException if an invalid ID is provided', async () => {
      const invalidId = 'invalid-id';
      const errorMessage = `Subcategory with ID "${invalidId}" not found`;
      mockSubCategoriesService.findOneById.mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a subcategory and return the new data', async () => {
      const subcategoryId = 'someSubId';
      const updateDto: UpdateSubCategoryDto = {
        name: 'Wireless Headphones',
        category: mockCategoryId,
      };
      const updatedSubcategory = {
        ...mockCreatedSubcategory,
        name: 'Wireless Headphones',
        slugname: 'wireless-headphones',
      };
      mockSubCategoriesService.update.mockResolvedValue(updatedSubcategory);

      const result = await controller.update(subcategoryId, updateDto);

      expect(service.update).toHaveBeenCalledWith(subcategoryId, updateDto);
      expect(result).toEqual({
        status: 'success',
        data: { subcategory: updatedSubcategory },
      });
    });

    it('should throw NotFoundException when trying to update a non-existent subcategory', async () => {
      const invalidId = 'invalid-id';
      const updateDto: UpdateSubCategoryDto = {
        name: 'Does Not Matter',
        category: '',
      };
      mockSubCategoriesService.update.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.update(invalidId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a subcategory and return it', async () => {
      const subcategoryId = 'someSubId';
      mockSubCategoriesService.remove.mockResolvedValue(mockCreatedSubcategory);

      const result = await controller.remove(subcategoryId);

      expect(service.remove).toHaveBeenCalledWith(subcategoryId);
      expect(result).toEqual({
        status: 'success',
        data: { subcategory: mockCreatedSubcategory },
      });
    });

    it('should throw NotFoundException when trying to remove a non-existent subcategory', async () => {
      const invalidId = 'invalid-id';
      mockSubCategoriesService.remove.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
