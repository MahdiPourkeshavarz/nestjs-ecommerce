/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model, Query, QueryOptions } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthCredentialsSignupDto } from 'src/auth/dto/auth-credentials.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: AuthCredentialsSignupDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findOne(
    filterQuery: FilterQuery<UserDocument>,
    select?: string | Record<string, number>,
  ): Promise<UserDocument | null> {
    let query: Query<UserDocument | null, UserDocument> =
      this.userModel.findOne(filterQuery);
    if (select) {
      query = query.select(select);
    }
    return query.exec();
  }

  async findById(
    id: string,
    select?: string | Record<string, number>,
  ): Promise<UserDocument | null> {
    let query: Query<UserDocument | null, UserDocument> =
      this.userModel.findById(id);
    if (select) {
      query = query.select(select);
    }
    return query.exec();
  }

  async updateUserRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    if (hashedRefreshToken) {
      await this.userModel.updateOne(
        { id: userId },
        { refreshToken: hashedRefreshToken },
      );
    } else {
      await this.userModel.updateOne(
        { id: userId },
        { $unset: { refreshToken: 1 } },
      );
    }
  }

  async findAll(
    queryDto: QueryUserDto,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const { limit = 10, page = 1, sort, fields, ...filterParams } = queryDto;
    const skip = (page - 1) * limit;

    const queryFilter: FilterQuery<UserDocument> = {};
    if (filterParams.username) {
      queryFilter.username = {
        $regex: filterParams.username,
        $options: 'i',
      } as any;
    }
    if (filterParams.email) {
      queryFilter.email = { $regex: filterParams.email, $options: 'i' } as any;
    }
    if (filterParams.role) {
      queryFilter.role = filterParams.role;
    }

    let query: Query<UserDocument[] | null, UserDocument> = this.userModel
      .find(queryFilter)
      .skip(skip)
      .limit(limit);

    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort
    }

    if (fields) {
      const fieldsBy = fields.split(',').join(' ');
      query = query.select(fieldsBy);
    }

    const users = (await query.exec()) ?? [];
    const total = await this.userModel.countDocuments(queryFilter);

    return { users, total };
  }

  async findByIdAndUpdate(
    id: string,
    updateUserDto: Partial<UpdateUserDto>,
    options?: QueryOptions,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id).select('+password');
    if (!user) {
      return null;
    }

    Object.assign(user, updateUserDto);
    return user.save({ validateBeforeSave: true, ...options });
  }

  async findByIdAndDelete(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async exists(filterQuery: FilterQuery<UserDocument>): Promise<boolean> {
    const count = await this.userModel.countDocuments(filterQuery);
    return count > 0;
  }
}
