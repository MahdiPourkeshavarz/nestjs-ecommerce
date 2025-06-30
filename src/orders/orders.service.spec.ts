/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { UserRole } from '../auth/dto/auth-credentials.dto';
import { ProductsRepository } from '../products/product.repository';
import { UsersRepository } from '../users/users.repository';
import { OrdersRepository } from './orders.repository';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schema/orders.schema';

const mockProductRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
};

const mockUsersRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
};

const mockOrdersRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
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
  totalPrice: 360,
  toObject: () => ({
    ...createdOrder,
  }),
};

const anotherCreatedOrder = {
  id: orderId2,
  user: mockAnotherCreatedUser,
  products: [createdProduct, anotherCreatedProduct],
  deliveryDate: date,
  deliveryStatus: false,
  totalPrice: 360,
  toObject: () => ({
    ...anotherCreatedOrder,
  }),
};

const updateOrderDto = {
  deliveryStatus: true,
};

describe('OrdersService', () => {
  let service: OrdersService;
  let productsRepo;
  let usersRepo;
  let ordersRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ProductsRepository, useValue: mockProductRepository },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: OrdersRepository, useValue: mockOrdersRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    productsRepo = module.get<ProductsRepository>(ProductsRepository);
    usersRepo = module.get<UsersRepository>(UsersRepository);
    ordersRepo = module.get<OrdersRepository>(OrdersRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      usersRepo.findById.mockResolvedValue(mockCreatedUser);
      productsRepo.findById.mockImplementation((id) => {
        if (id === productId1) return Promise.resolve(createdProduct);
        if (id === productId2) return Promise.resolve(anotherCreatedProduct);
        return Promise.resolve(null);
      });
    });

    it('should create an order successfully with correct total price', async () => {
      ordersRepo.create.mockResolvedValue(createdOrder);
      const expectedTotalPrice =
        createdProduct.price * 1 + anotherCreatedProduct.price * 2;

      const result = await service.create(createOrderDto);

      expect(ordersRepo.create).toHaveBeenCalledWith({
        ...createOrderDto,
        totalPrice: expectedTotalPrice,
      });
      expect(result.totalPrice).toBe(expectedTotalPrice);
    });

    it('should throw NotFoundException if user is not found', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if a product is not found', async () => {
      productsRepo.findById.mockImplementation((id) => {
        if (id === productId1) return Promise.resolve(createdProduct);
        return Promise.resolve(null);
      });
      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if repository create fails', async () => {
      ordersRepo.create.mockRejectedValue(new Error('DB Error'));
      await expect(service.create(createOrderDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all orders with pagination', async () => {
      const serviceResponse = {
        status: 'success',
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: { orders: [createdOrder, anotherCreatedOrder] },
      };

      const orderRepoResponse = {
        orders: [createdOrder, anotherCreatedOrder],
        total: 2,
      };
      ordersRepo.findAll.mockResolvedValue(orderRepoResponse);
      const result = await service.findAll();
      expect(result.total).toBe(2);
      expect(result.data.orders.length).toBe(2);
      expect(result.data.orders[0]).toEqual(createdOrder);
    });
  });

  describe('findOneById', () => {
    it('should find and return a single order', async () => {
      ordersRepo.findById.mockResolvedValue(createdOrder);
      const result = await service.findOneById(orderId);
      expect(ordersRepo.findById).toHaveBeenCalledWith(orderId);
      expect(result.id).toBe(orderId);
    });

    it('should throw NotFoundException if order is not found', async () => {
      ordersRepo.findById.mockResolvedValue(null);
      await expect(service.findOneById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const updatedOrder = {
        id: orderId,
        user: userId,
        deliveryDate: date,
        deliveryStatus: true,
        products: [
          {
            product: createdProduct,
            count: 1,
          },
          {
            product: anotherCreatedProduct,
            count: 2,
          },
        ],
        toObject: () => ({
          ...updatedOrder,
        }),
      };
      usersRepo.findById.mockResolvedValue(mockCreatedUser);
      ordersRepo.findById.mockResolvedValue(createdOrder);
      ordersRepo.update.mockResolvedValue(updatedOrder);

      const result = await service.update(orderId, updateOrderDto);
      expect(ordersRepo.update).toHaveBeenCalledWith(orderId, updateOrderDto);
      expect(result.deliveryStatus).toBe(true);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.update(orderId, updateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an order successfully', async () => {
      ordersRepo.remove.mockResolvedValue(createdOrder);
      const result = await service.remove(orderId);
      expect(ordersRepo.remove).toHaveBeenCalledWith(orderId);
      expect(result.id).toBe(orderId);
    });

    it('should throw NotFoundException if order to remove is not found', async () => {
      ordersRepo.remove.mockResolvedValue(null);
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
