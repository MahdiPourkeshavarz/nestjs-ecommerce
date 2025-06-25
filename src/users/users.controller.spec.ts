/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { PaginatedUsersResult, UsersService } from './users.service';
import { UserRole } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  const mockUsersService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserDto = {
    firstname: 'mahdi',
    lastname: 'pk',
    username: 'meitipk',
    password: 'M@blackops77',
    phoneNumber: '09199955776',
    address: 'tehran',
  };

  const mockCreatedUser = {
    id: 'someID',
    role: UserRole.USER,
    ...mockUserDto,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should call update in service and return updated user', async () => {
      const userId = 'someID';
      const updateDto = { firstname: 'mehdii' };
      const updateUser = { ...mockCreatedUser, ...updateDto };

      mockUsersService.update.mockResolvedValue(updateUser);

      const res = await controller.update(userId, updateDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
      expect(res).toEqual({
        status: 'success',
        data: {
          user: updateUser,
        },
      });
    });
  });

  describe('create', () => {
    it('should call update in service and return created user', async () => {
      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const res = await controller.create(mockUserDto);

      expect(service.create).toHaveBeenCalledWith(mockUserDto);
      expect(res).toEqual({
        status: 'success',
        data: {
          user: mockCreatedUser,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should call the method on service and return paginated result', async () => {
      const query = { page: 1, limit: 10 };
      const PaginatedUsersResult: PaginatedUsersResult = {
        status: 'success',
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: { users: [mockCreatedUser] },
      };
      mockUsersService.findAll.mockResolvedValue(PaginatedUsersResult);

      const res = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalled();
      expect(res.total).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('should call the method on service and return requested user', async () => {
      const userId = 'someID';
      mockUsersService.findOne.mockResolvedValue(mockCreatedUser);

      const res = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalled();

      expect(res.status).toBe('success');
    });
  });

  describe('remove', () => {
    it('should call the service remove method and return the deleted user', async () => {
      const userId = 'someID';
      mockUsersService.remove.mockResolvedValue(mockCreatedUser);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        status: 'success',
        data: { user: mockCreatedUser },
      });
    });
  });
});
