import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Transaction, Prisma } from '../generated/prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionLimitDto } from './dto/get-transaction-limit.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private readonly DAILY_LIMIT = 50000.0;
  private readonly MONTHLY_LIMIT = 500000.0;

  async getDailyTransferLimitData(
    userId: string,
    date: Date = new Date(),
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<GetTransactionLimitDto> {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const dailySpendResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        senderId: userId,
        createdAt: { gte: startOfDay },
      },
    });

    return {
      duration: 'daily',
      cap: this.DAILY_LIMIT,
      used: Number(dailySpendResult?._sum?.amount?.toNumber() ?? 0),
      remaining:
        Number(this.DAILY_LIMIT) -
        Number(dailySpendResult?._sum?.amount?.toNumber() ?? 0),
    };
  }

  async getMonthlyTransferLimitData(
    userId: string,
    date: Date = new Date(),
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<GetTransactionLimitDto> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const monthlySpendResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        senderId: userId,
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      duration: 'monthly',
      cap: this.MONTHLY_LIMIT,
      used: Number(monthlySpendResult?._sum?.amount?.toNumber() ?? 0),
      remaining:
        Number(this.MONTHLY_LIMIT) -
        Number(monthlySpendResult?._sum?.amount?.toNumber() ?? 0),
    };
  }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    const { senderId, recipientId, amount, ...rest } = data;

    const amountNumber =
      amount instanceof Prisma.Decimal ? amount.toNumber() : Number(amount);

    if (amountNumber <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const sender = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "users" WHERE id = ${senderId} FOR UPDATE
        `;

        if (!sender || sender.length === 0) {
          throw new NotFoundException('Sender user not found');
        }

        const currentDaily = await this.getDailyTransferLimitData(
          data.senderId,
          new Date(),
          tx,
        );
        const currentMonthly = await this.getMonthlyTransferLimitData(
          data.senderId,
          new Date(),
          tx,
        );

        if (Number(currentDaily.used) + amountNumber > this.DAILY_LIMIT) {
          throw new BadRequestException(
            `Daily limit of $${this.DAILY_LIMIT} exceeded`,
          );
        }
        if (Number(currentMonthly.used) + amountNumber > this.MONTHLY_LIMIT) {
          throw new BadRequestException(
            `Monthly limit of $${this.MONTHLY_LIMIT} exceeded`,
          );
        }

        return await tx.transaction.create({
          data: {
            ...rest,
            amount: new Prisma.Decimal(amount),
            sender: {
              connect: { id: senderId },
            },
            recipient: {
              connect: { id: recipientId },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Sender or Recipient user not found');
      }
      throw error;
    }
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
