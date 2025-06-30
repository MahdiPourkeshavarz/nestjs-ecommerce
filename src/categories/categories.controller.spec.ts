/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';

const mockCategoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const categoryId = 'CategoryId';

const createCategoryDto = {
  name: 'newCategory',
};

const updateCategoryDto = {
  name: 'newName',
};

const createdCategory = {
  id: categoryId,
  name: 'newCategory',
  slugname: 'newcategory',
  icon: 'img.jpg',
};

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoryService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the new category', async () => {
      mockCategoryService.create.mockResolvedValue(createdCategory);

      const result = await controller.create(createCategoryDto);

      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual({
        status: 'success',
        data: { category: createdCategory },
      });
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return an array of categories', async () => {
      const categoriesArray = [createdCategory];
      mockCategoryService.findAll.mockResolvedValue(categoriesArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'success',
        data: { categories: categoriesArray },
      });
    });
  });

  describe('findOne', () => {
    it('should call service.findOneById and return a single category', async () => {
      mockCategoryService.findOneById.mockResolvedValue(createdCategory);

      const result = await controller.findOne(categoryId);

      expect(service.findOneById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({
        status: 'success',
        data: { category: createdCategory },
      });
    });
  });

  describe('update', () => {
    it('should call service.update and return the updated category', async () => {
      const updatedCategory = {
        ...createdCategory,
        name: 'newName',
        slugname: 'newname',
      };
      mockCategoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(categoryId, updateCategoryDto);

      expect(service.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
      );
      expect(result).toEqual({
        status: 'success',
        data: { category: updatedCategory },
      });
    });
  });

  describe('remove', () => {
    it('should call service.remove and return the removed category', async () => {
      mockCategoryService.remove.mockResolvedValue(createdCategory);

      const result = await controller.remove(categoryId);

      expect(service.remove).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({
        status: 'success',
        data: { category: createdCategory },
      });
    });
  });
});
