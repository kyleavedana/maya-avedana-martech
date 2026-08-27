import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Transaction, Prisma } from '../generated/prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { senderId, recipientId, ...rest } = createTransactionDto;

    return this.prisma.transaction.create({
      data: {
        ...rest,
        sender: {
          connect: { id: senderId },
        },
        recipient: {
          connect: { id: recipientId },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TransactionWhereUniqueInput;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }): Promise<Transaction[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.transaction.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(
    userWhereUniqueInput: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: userWhereUniqueInput,
    });
  }
}
