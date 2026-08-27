import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Transaction, Prisma } from '../generated/prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionLimitDto } from './dto/get-transaction-limit.dto';
import { TZDate } from '@date-fns/tz';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private readonly TIMEZONE = 'Asia/Manila';
  private readonly DAILY_LIMIT = new Prisma.Decimal(50000.0);
  private readonly MONTHLY_LIMIT = new Prisma.Decimal(500000.0);

  /**
   * Helper to fetch current date/time anchored to Asia/Manila.
   */
  private getManilaDate(date: Date = new Date()): TZDate {
    return new TZDate(date, this.TIMEZONE);
  }

  /**
   * Returns start of day (00:00:00.000) in Asia/Manila converted to UTC Date
   */
  private getStartOfDayPHT(date: Date = new Date()): Date {
    const manila = this.getManilaDate(date);
    return new Date(
      Date.UTC(
        manila.getFullYear(),
        manila.getMonth(),
        manila.getDate(),
        -8,
        0,
        0,
        0,
      ),
    );
  }

  /**
   * Returns start of month (1st 00:00:00.000) in Asia/Manila converted to UTC Date
   */
  private getStartOfMonthPHT(date: Date = new Date()): Date {
    const manila = this.getManilaDate(date);
    return new Date(
      Date.UTC(manila.getFullYear(), manila.getMonth(), 1, -8, 0, 0, 0),
    );
  }

  async getDailyTransferLimitData(
    userId: string,
    date: Date = new Date(),
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<GetTransactionLimitDto> {
    const startOfDay = this.getStartOfDayPHT(date);

    const dailySpendResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        senderId: userId,
        createdAt: { gte: startOfDay },
      },
    });

    const used = dailySpendResult?._sum?.amount ?? new Prisma.Decimal(0);
    const remaining = Prisma.Decimal.max(0, this.DAILY_LIMIT.sub(used));

    return {
      duration: 'daily',
      cap: this.DAILY_LIMIT.toNumber(),
      used: used.toNumber(),
      remaining: remaining.toNumber(),
    };
  }

  async getMonthlyTransferLimitData(
    userId: string,
    date: Date = new Date(),
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<GetTransactionLimitDto> {
    const startOfMonth = this.getStartOfMonthPHT(date);

    const monthlySpendResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        senderId: userId,
        createdAt: { gte: startOfMonth },
      },
    });

    const used = monthlySpendResult?._sum?.amount ?? new Prisma.Decimal(0);
    const remaining = Prisma.Decimal.max(0, this.MONTHLY_LIMIT.sub(used));

    return {
      duration: 'monthly',
      cap: this.MONTHLY_LIMIT.toNumber(),
      used: used.toNumber(),
      remaining: remaining.toNumber(),
    };
  }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    const { senderId, recipientId, amount, ...rest } = data;
    const decimalAmount = new Prisma.Decimal(amount);

    if (decimalAmount.lte(0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (senderId === recipientId) {
      throw new BadRequestException(
        'Sender and recipient cannot be the same user',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Lock sender record row to prevent race conditions during aggregations
        const sender = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "users" WHERE id = ${senderId} FOR UPDATE
        `;

        if (!sender || sender.length === 0) {
          throw new NotFoundException('Sender user not found');
        }

        const currentDaily = await this.getDailyTransferLimitData(
          senderId,
          new Date(),
          tx,
        );
        const currentMonthly = await this.getMonthlyTransferLimitData(
          senderId,
          new Date(),
          tx,
        );

        const newDailyTotal = new Prisma.Decimal(currentDaily.used).add(
          decimalAmount,
        );
        const newMonthlyTotal = new Prisma.Decimal(currentMonthly.used).add(
          decimalAmount,
        );

        if (newDailyTotal.gt(this.DAILY_LIMIT)) {
          throw new BadRequestException(
            `Daily transfer limit of ₱${this.DAILY_LIMIT.toLocaleString()} exceeded`,
          );
        }

        if (newMonthlyTotal.gt(this.MONTHLY_LIMIT)) {
          throw new BadRequestException(
            `Monthly transfer limit of ₱${this.MONTHLY_LIMIT.toLocaleString()} exceeded`,
          );
        }

        return await tx.transaction.create({
          data: {
            ...rest,
            amount: decimalAmount,
            sender: { connect: { id: senderId } },
            recipient: { connect: { id: recipientId } },
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
