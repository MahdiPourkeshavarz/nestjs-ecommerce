/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    adminCreateUser: jest.fn((dto) => {
      return {
        ...dto,
        id: Date.now(),
      };
    }),
    update: jest.fn((id, dto) => ({
      id,
      ...dto,
    })),
  };

  const dto = {
    id: '12312313',
    firstname: 'mahdi',
    lastname: 'pk',
    phoneNumber: '09199955776',
    password: 'M@blackops77',
    username: 'meitipk',
    wishlist: [],
    address: 'tehran',
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an admin user', () => {
    expect(controller.adminCreateUser(dto)).toEqual({
      id: expect.any(Number),
      dto,
    });
  });

  expect(mockUsersService.adminCreateUser).toHaveBeenCalledTimes(1);

  it('should update a user', () => {
    expect(controller.update('12312313', dto)).toEqual({
      id: '12312313',
      dto,
    });
    expect(mockUsersService.update).toHaveBeenCalled();
  });
});
