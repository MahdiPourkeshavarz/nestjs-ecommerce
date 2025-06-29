/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Readable } from 'stream';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';

const mockProductsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

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
};

const anotherCreatedProduct = {
  id: 'anotherProductId',
  ...mockCreateProductDto,
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

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call this method in service and return result', async () => {
      const mockFiles = {
        thumbnail: createMockFile('thumbnail', 'thumb.jpg', 'image/jpeg'),
        images: [createMockFile('images', 'img1.png', 'image/png')],
      };

      (service.create as jest.Mock).mockResolvedValue(createdProduct);

      const res = await controller.create(mockCreateProductDto, mockFiles);

      expect(service.create).toHaveBeenCalled();
      expect(res.data.product).toEqual(createdProduct);
    });
    it('should handle creation correctly when no files are uploaded', async () => {
      const mockFiles = {};
      (service.create as jest.Mock).mockResolvedValue(createdProduct);

      const res = await controller.create(mockCreateProductDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto, {});
      expect(res.data.product).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('should call this method on service and return all products', async () => {
      const products = {
        products: [createdProduct, anotherCreatedProduct],
      };

      const paginatedFindAllResult = {
        status: 'success',
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: { products },
      };

      mockProductsService.findAll.mockResolvedValue(paginatedFindAllResult);

      const res = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(res).toEqual({
        status: 'success',
        data: {
          products,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should call this method on service and return the requested product', async () => {
      const productId = 'anotherProductId';

      mockProductsService.findOneById.mockResolvedValue(anotherCreatedProduct);

      const res = await controller.findOne(productId);

      expect(service.findOneById).toHaveBeenCalledWith(productId);

      expect(res.data.product.id).toEqual(productId);
    });
    it('should propagate NotFoundException when service throws it', async () => {
      const invalidId = 'invalid-id';
      mockProductsService.findOneById.mockRejectedValue(
        new NotFoundException(`product with ID "${invalidId}" not found`),
      );

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should call this method and return updated product as result', async () => {
      const updateDto: UpdateProductDto = {
        category: createdProduct.category,
        subcategory: createdProduct.subcategory,
        price: 135,
      };
      const updatedProduct = {
        ...createdProduct,
        price: 135,
      };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const res = await controller.update(mockProductId, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockProductId, updateDto);

      expect(res).toEqual({
        status: 'success',
        data: {
          product: updatedProduct,
        },
      });
    });
  });

  describe('remove', () => {
    it('should call this method on service and return the deleted product', async () => {
      mockProductsService.remove.mockResolvedValue(createdProduct);

      const res = await controller.remove(mockProductId);

      expect(service.remove).toHaveBeenCalledWith(mockProductId);

      expect(res).toEqual({
        status: 'success',
        data: {
          product: createdProduct,
        },
      });
    });
  });
});
