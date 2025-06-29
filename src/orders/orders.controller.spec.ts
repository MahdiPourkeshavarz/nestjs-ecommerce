/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../auth/dto/auth-credentials.dto';

const mockOrderService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const userId = 'userID';
const userId2 = 'userID2';
const productId1 = 'product1';
const productId2 = 'product2';
const date = new Date('2025-07-15T10:00:00.000Z');
const orderId = 'order1';
const orderId2 = 'order2';
const mockCategoryId = 'CategoryId';
const mockSubcategoryId = 'SubcategoryId';
const mockProductId = 'someID';

const mockUserDto = {
  firstname: 'mahdi',
  lastname: 'pk',
  username: 'meitipk',
  password: 'M@blackops77',
  phoneNumber: '09199955776',
  address: 'tehran',
};

const mockCreatedUser = {
  id: userId,
  role: UserRole.USER,
  ...mockUserDto,
};

const mockAnotherCreatedUser = {
  id: userId2,
  role: UserRole.USER,
  ...mockUserDto,
};

const mockCreateProductDto = {
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

const productList = [
  {
    product: productId1,
    count: 1,
  },
  {
    product: productId2,
    count: 2,
  },
];

const createOrderDto = {
  user: userId,
  products: productList,
  deliveryDate: date,
  deliveryStatus: false,
};

const createdOrder = {
  id: orderId,
  user: mockCreatedUser,
  products: [createdProduct, anotherCreatedProduct],
  deliveryDate: date,
  deliveryStatus: false,
  totalPrice: 12,
};

const anotherCreatedOrder = {
  id: orderId2,
  user: mockAnotherCreatedUser,
  products: [createdProduct, anotherCreatedProduct],
  deliveryDate: date,
  deliveryStatus: false,
  totalPrice: 12,
};

const updateOrderDto = {
  deliveryStatus: true,
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrderService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call this method on service and return the result', async () => {
      (service.create as jest.Mock).mockResolvedValue(createdOrder);

      const res = await controller.create(createOrderDto);

      expect(service.create).toHaveBeenCalled();

      expect(res.data.order).toEqual(createdOrder);
    });
  });

  describe('findAll', () => {
    it('should call this method on service and return all orders', async () => {
      const orders = [createdOrder, anotherCreatedOrder];

      const paginatedFindAllResult = {
        status: 'success',
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: { orders },
      };

      mockOrderService.findAll.mockResolvedValue(paginatedFindAllResult);

      const res = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(res).toEqual({
        status: 'success',
        data: {
          orders: paginatedFindAllResult,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should call the service with an ID and return a single order', async () => {
      mockOrderService.findOneById.mockResolvedValue(createdOrder);
      const result = await controller.findOne(orderId);
      expect(service.findOneById).toHaveBeenCalledWith(orderId);
      expect(result.data.order).toEqual(createdOrder);
    });
  });

  describe('update', () => {
    it('should call the service with an ID and update DTO, and return the updated order', async () => {
      const updatedOrder = { ...createdOrder, deliveryStatus: true };
      mockOrderService.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(orderId, updateOrderDto);

      expect(service.update).toHaveBeenCalledWith(orderId, updateOrderDto);
      expect(result.data.order).toEqual(updatedOrder);
    });
  });

  describe('remove', () => {
    it('should call the service with an ID and return the removed order', async () => {
      mockOrderService.remove.mockResolvedValue(anotherCreatedOrder);

      const result = await controller.remove(orderId2);

      expect(service.remove).toHaveBeenCalledWith(orderId2);
      expect(result.data.order).toEqual(anotherCreatedOrder);
    });
  });
});
