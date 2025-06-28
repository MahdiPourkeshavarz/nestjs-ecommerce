/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Readable } from 'stream';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from './product.repository';
import { CategoriesRepository } from '../categories/category.repository';
import { SubCategoriesRepository } from '../subcategories/subcategory.repository';
import { ImageProcessingService } from './image-processing.service';
import { FilterQuery } from 'mongoose';
import { ProductDocument } from './schema/products.schema';

const mockCategoryId = 'CategoryId';
const mockSubcategoryId = 'SubcategoryId';
const mockProductId = 'someID';

const mockCreateProductDto: CreateProductDto = {
  category: mockCategoryId,
  subcategory: mockSubcategoryId,
  name: 'beats pro',
  slugname: 'beats-pro',
  brand: 'beats',
  price: 120,
  discount: 10,
  quantity: 5,
  description: 'very good airpods',
  rating: { count: 100, rate: 4.6 },
};

const createdProduct = {
  id: mockProductId,
  ...mockCreateProductDto,
  thumbnail: 'thumb.jpg',
  images: ['img1.jpg', 'img2.jpg'],
  save: jest.fn().mockResolvedValue(true),
  toObject: () => ({
    id: mockProductId,
    ...mockCreateProductDto,
  }),
};

const anotherCreatedProduct = {
  id: 'anotherProductId',
  ...mockCreateProductDto,
  thumbnail: '',
  images: [],
  save: jest.fn().mockResolvedValue(true),
  toObject: () => ({
    id: 'anotherProductId',
    ...mockCreateProductDto,
  }),
};

const createdCategory = {
  id: mockCategoryId,
  name: 'tech',
  slugname: 'tech',
  icon: 'icon.jpg',
};

const createdSubcategory = {
  id: mockSubcategoryId,
  name: 'headphones',
  slugname: 'headphones',
};

const createMockFile = (
  fieldname: string,
  originalname: string,
  mimetype: string,
): Express.Multer.File => {
  const buffer = Buffer.from('mock-file-content', 'utf-8');
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return {
    fieldname,
    originalname,
    encoding: 'utf-8',
    mimetype,
    buffer,
    size: buffer.length,
    stream,
    destination: '',
    filename: '',
    path: '',
  };
};

const mockProductsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findById: jest.fn(),
  exists: jest.fn(),
};

const mockCategoriesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findById: jest.fn(),
  exists: jest.fn(),
};

const mockImageProcessingService = {
  resizeProductThumbnails: jest.fn(),
  resizeProductsImages: jest.fn(),
};

const mockSubcategoriesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findById: jest.fn(),
  exists: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo;
  let categoryRepo;
  let subcategoryRepo;
  let imageProcessingService;

  const mockFiles = {
    thumbnail: createMockFile('thumbnail', 'thumb.jpg', 'image/jpeg'),
    images: [
      createMockFile('image1', 'image1.jpg', 'image/jpeg'),
      createMockFile('image2', 'image2.jpg', 'image/jpeg'),
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
        { provide: CategoriesRepository, useValue: mockCategoriesRepository },
        {
          provide: SubCategoriesRepository,
          useValue: mockSubcategoriesRepository,
        },
        {
          provide: ImageProcessingService,
          useValue: mockImageProcessingService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get<ProductsRepository>(ProductsRepository);
    categoryRepo = module.get<CategoriesRepository>(CategoriesRepository);
    subcategoryRepo = module.get<SubCategoriesRepository>(
      SubCategoriesRepository,
    );
    imageProcessingService = module.get<ImageProcessingService>(
      ImageProcessingService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call this method on repo and return created product', async () => {
      categoryRepo.findById.mockResolvedValue(createdCategory);
      subcategoryRepo.findById.mockResolvedValue(createdSubcategory);
      productRepo.exists.mockResolvedValue(false);

      productRepo.create.mockResolvedValue(createdProduct);

      imageProcessingService.resizeProductThumbnails.mockResolvedValue(
        'thumb.jpg',
      );
      imageProcessingService.resizeProductsImages.mockResolvedValue([
        'img1.jpg',
        'img2.jpg',
      ]);

      productRepo.findById.mockResolvedValue({
        ...createdProduct,
        thumbnail: 'thumb.jpg',
        images: ['img1.jpg', 'img2.jpg'],
      });

      const res = await service.create(mockCreateProductDto, mockFiles);

      expect(productRepo.create).toHaveBeenCalled();
      expect(createdProduct.save).toHaveBeenCalled();
      expect(res.thumbnail).toEqual('thumb.jpg');
    });

    it('should throw notFound and handle error for invalid category id', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(mockCreateProductDto, mockFiles),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw notFound and handle error for invalid subcategory id', async () => {
      categoryRepo.findById.mockResolvedValue(createdCategory);
      subcategoryRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(mockCreateProductDto, mockFiles),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException and handle error for invalid subcategory id', async () => {
      categoryRepo.findById.mockResolvedValue(createdCategory);
      subcategoryRepo.findById.mockResolvedValue(createdSubcategory);
      productRepo.exists.mockResolvedValue(true);

      await expect(
        service.create(mockCreateProductDto, mockFiles),
      ).rejects.toThrow(ConflictException);
    });

    it('should call this method on repo and return created product', async () => {
      const mockfailedProduct = {
        id: 'id-123',
        ...mockCreateProductDto,
        thumbnail: '',
        images: [],
        save: jest
          .fn()
          .mockRejectedValue(new Error('database failed to create product')),
      };

      categoryRepo.findById.mockResolvedValue(createdCategory);
      subcategoryRepo.findById.mockResolvedValue(createdSubcategory);
      productRepo.exists.mockResolvedValue(false);

      productRepo.create.mockResolvedValue(createdProduct);

      imageProcessingService.resizeProductThumbnails.mockResolvedValue(
        'thumb.jpg',
      );
      imageProcessingService.resizeProductsImages.mockResolvedValue([
        'img1.jpg',
        'img2.jpg',
      ]);

      productRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(mockfailedProduct, mockFiles),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of all products', async () => {
      const repoResponse = { products: [createdProduct], total: 1 };
      productRepo.findAll.mockResolvedValue(repoResponse);
      const result = await service.findAll();
      expect(result.total).toBe(1);
      expect(result.data.products[0].id).toEqual(mockProductId);
    });
  });

  describe('findOneById', () => {
    it('should return a single product if found', async () => {
      productRepo.findById.mockResolvedValue(createdProduct);
      const result = await service.findOneById(mockProductId);
      expect(productRepo.findById).toHaveBeenCalledWith(mockProductId);
      expect(result.id).toEqual(mockProductId);
    });

    it('should throw NotFoundException if the product is not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.findOneById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Beats Pro',
      category: mockCategoryId,
      subcategory: mockSubcategoryId,
    };
    const updatedProductDoc = {
      ...createdProduct,
      name: 'Updated Beats Pro',
      toObject: () => ({
        ...createdProduct.toObject(),
        name: 'Updated Beats Pro',
      }),
    };
    it('should update a product successfully', async () => {
      productRepo.findById.mockResolvedValue(createdProduct);
      productRepo.exists.mockResolvedValue(false);
      productRepo.update.mockResolvedValue(updatedProductDoc);

      const result = await service.update(mockProductId, updateDto);
      expect(productRepo.update).toHaveBeenCalledWith(mockProductId, {
        name: 'Updated Beats Pro',
        slugname: 'updated-beats-pro',
        category: mockCategoryId,
        subcategory: mockSubcategoryId,
      });
      expect(result.name).toEqual('Updated Beats Pro');
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      productRepo.remove.mockResolvedValue(createdProduct);
      const result = await service.remove(mockProductId);
      expect(productRepo.remove).toHaveBeenCalledWith(mockProductId);
      expect(result.id).toEqual(mockProductId);
    });
  });
});
