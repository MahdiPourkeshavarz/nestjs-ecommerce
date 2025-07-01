/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const mockUserRepository = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  exists: jest.fn(),
  findByUsername: jest.fn(),
});

const createUserDto = {
  firstname: 'mahdi',
  lastname: 'pk',
  username: 'meitipk',
  password: 'Ma@blackops77',
  phoneNumber: '09199955776',
  address: 'tehran, eslam',
};

const mockUser2 = {
  firstname: 'ali',
  lastname: 'pk',
  username: 'alioo',
  password: 'Ma@blackops77',
  phoneNumber: '09199955775',
  address: 'tehran, eslam',
};

describe('UsersService', () => {
  let userService: UsersService;
  let usersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useFactory: mockUserRepository },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ADMIN') return 'testadmin';
              return null;
            }),
          },
        },
      ],
    }).compile();
    userService = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should call create method on repo and return result', async () => {
      const savedUser = {
        ...createUserDto,
        _id: 'someID',
        toObject: jest.fn().mockReturnValue({
          ...createUserDto,
          _id: 'someID',
        }),
      };
      usersRepository.exists.mockResolvedValue(false);
      usersRepository.create.mockResolvedValue(savedUser);
      expect(usersRepository.create).not.toHaveBeenCalled();
      const res = await userService.create(createUserDto);
      expect(usersRepository.exists).toHaveBeenCalledTimes(2);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        username: 'meitipk',
      });
      expect(res).not.toHaveProperty('password');
      expect(res.username).toEqual('meitipk');
    });
    it('should call create method on repo and handle error', () => {
      expect(usersRepository.create).not.toHaveBeenCalled();
      usersRepository.create.mockResolvedValue('user created');
      expect(userService.create(mockUser2)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should call this method on repo and return result', async () => {
      const userId = 'someID';
      const userFromdb = {
        ...mockUser2,
        _id: userId,
        toObject: jest.fn().mockReturnValue({ ...mockUser2, _id: userId }),
      };
      usersRepository.findById.mockResolvedValue(userFromdb);
      const res = await userService.findOne(userId);
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(res.username).toEqual(mockUser2.username);
    });
    it('should call this method and handle error', () => {
      const userId = 'someWrongID';
      usersRepository.findOne.mockResolvedValue(null);
      expect(userService.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should call this method on repo and return result', async () => {
      const repoResult = {
        users: [
          { ...mockUser2, toObject: jest.fn().mockReturnValue(mockUser2) },
          { ...mockUser2, toObject: jest.fn().mockReturnValue(mockUser2) },
        ],
        total: 2,
      };
      usersRepository.findAll.mockResolvedValue(repoResult);
      const query = { page: 1, limit: 10 };
      const res = await userService.findAll(query);
      expect(res.total).toBe(2);
      expect(usersRepository.findAll).toHaveBeenCalledWith(query);
      expect(res.data.users[1]).not.toHaveProperty('password');
    });
  });

  jest.clearAllMocks();
});
