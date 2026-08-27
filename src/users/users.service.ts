import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User | undefined> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
          ...(data.phoneNumber ? [{ phoneNumber: data.phoneNumber }] : []),
        ],
      },
      select: { username: true, email: true, phoneNumber: true },
    });

    if (existingUser) {
      if (existingUser.username === data.username) {
        throw new ConflictException('Username is already taken.');
      }
      if (existingUser.email === data.email) {
        throw new ConflictException('Email is already registered.');
      }
      if (data.phoneNumber && existingUser.phoneNumber === data.phoneNumber) {
        throw new ConflictException('Phone number is already in use.');
      }
    } else {
      return await this.prisma.user.create({ data });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }
}
