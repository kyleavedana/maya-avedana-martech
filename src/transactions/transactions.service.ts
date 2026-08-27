import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Transaction, Prisma } from '../generated/prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private readonly DAILY_LIMIT = 50000.0;
  private readonly MONTHLY_LIMIT = 500000.0;

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { senderId, recipientId, amount, ...rest } = createTransactionDto;

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

        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const dailySpendResult = await tx.transaction.aggregate({
          _sum: { amount: true },
          where: {
            senderId,
            createdAt: { gte: startOfDay },
          },
        });
        const monthlySpendResult = await tx.transaction.aggregate({
          _sum: { amount: true },
          where: {
            senderId,
            createdAt: { gte: startOfMonth },
          },
        });

        const currentDaily = Number(
          dailySpendResult._sum.amount?.toNumber() ?? 0,
        );
        const currentMonthly = Number(
          monthlySpendResult._sum.amount?.toNumber() ?? 0,
        );

        if (currentDaily + amountNumber > this.DAILY_LIMIT) {
          throw new BadRequestException(
            `Daily limit of $${this.DAILY_LIMIT} exceeded`,
          );
        }
        if (currentMonthly + amountNumber > this.MONTHLY_LIMIT) {
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
