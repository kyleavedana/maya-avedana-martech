import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma.service';
import { Transaction, Prisma } from '../generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockTransaction: Transaction = {
    id: 'tx-1',
    senderId: 'senderId',
    recipientId: 'recipientId',
    amount: new Prisma.Decimal(100),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction;

  const mockTxContext = {
    $queryRaw: jest.fn(),
    transaction: {
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockPrismaService = {
    /* eslint-disable-next-line */
    $transaction: jest.fn((cb) => cb(mockTxContext)),
    transaction: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      senderId: 'senderId',
      recipientId: 'recipientId',
      amount: new Decimal(100),
    };

    beforeEach(() => {
      mockTxContext.$queryRaw.mockResolvedValue([{ id: 'senderId' }]);
      mockTxContext.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(0) } })
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(0) } });
    });

    it('should create and return a transaction', async () => {
      mockTxContext.transaction.create.mockResolvedValue(mockTransaction);
      mockTxContext.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(49950) } })
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(0) } });

      const result = await service.create(dto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockTxContext.$queryRaw).toHaveBeenCalled();
      expect(mockTxContext.transaction.aggregate).toHaveBeenCalledTimes(2);
      expect(mockTxContext.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: new Prisma.Decimal(dto.amount),
          sender: { connect: { id: dto.senderId } },
          recipient: { connect: { id: dto.recipientId } },
        },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw BadRequestException if amount is zero or negative', async () => {
      mockTxContext.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(49950) } })
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(0) } });

      await expect(
        service.create({ ...dto, amount: new Decimal(0) }),
      ).rejects.toThrow(
        new BadRequestException('Amount must be greater than 0'),
      );

      await expect(
        service.create({ ...dto, amount: new Decimal(-10) }),
      ).rejects.toThrow(
        new BadRequestException('Amount must be greater than 0'),
      );
    });

    it('should throw NotFoundException if sender does not exist in raw query', async () => {
      mockTxContext.$queryRaw.mockResolvedValue([]);

      await expect(service.create(dto)).rejects.toThrow(
        new NotFoundException('Sender user not found'),
      );
    });

    it('should throw BadRequestException if daily limit is exceeded', async () => {
      mockTxContext.transaction.aggregate.mockReset();
      mockTxContext.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(49950) } }) // daily
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(49950) } }); // monthly

      await expect(
        service.create({ ...dto, amount: new Decimal(100) }),
      ).rejects.toThrow(
        new BadRequestException('Daily transfer limit of ₱50000 exceeded'),
      );
    });

    it('should throw BadRequestException if monthly limit is exceeded', async () => {
      mockTxContext.transaction.aggregate.mockReset();
      mockTxContext.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(0) } })
        .mockResolvedValueOnce({
          _sum: { amount: new Prisma.Decimal(499950) },
        });

      await expect(
        service.create({ ...dto, amount: new Decimal(100) }),
      ).rejects.toThrow(
        new BadRequestException('Monthly transfer limit of ₱500000 exceeded'),
      );
    });

    it('should catch Prisma P2025 error and throw NotFoundException', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record required but not found.',
        { code: 'P2025', clientVersion: '5.0.0' },
      );

      mockTxContext.transaction.create.mockRejectedValue(prismaError);

      await expect(service.create(dto)).rejects.toThrow(
        new NotFoundException('Sender or Recipient user not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions with query parameters', async () => {
      const transactions = [mockTransaction];
      const params = {
        skip: 0,
        take: 10,
        where: { senderId: 'user-1' },
      };

      mockPrismaService.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.findAll(params);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(transactions);
    });
  });

  describe('findOne', () => {
    it('should return a transaction if found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      const result = await service.findOne({ id: 'tx-1' });

      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should return null if transaction is not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      const result = await service.findOne({ id: 'non-existent-id' });

      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });
  });
});
