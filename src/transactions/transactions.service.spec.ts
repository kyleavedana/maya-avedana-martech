import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma.service';
import { Transaction, Prisma } from '../generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockTransaction: Transaction = {
    id: 'id',
    senderId: 'senderId',
    recipientId: 'recipientId',
    amount: new Decimal(100),
  } as Transaction;

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
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
    it('should create and return a transaction', async () => {
      const createInput = {
        id: 'id',
        senderId: 'senderId',
        recipientId: 'recipientId',
        amount: new Decimal(100),
        sender: { connect: { id: 'senderId' } },
        recipient: { connect: { id: 'recipientId' } },
      };

      const { senderId, recipientId, ...expectedPrismaData } = createInput;

      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create({
        senderId,
        recipientId,
        ...expectedPrismaData,
      });

      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: expectedPrismaData,
      });
      expect(result).toEqual(mockTransaction);
    });
    it('should throw NotFoundException when sender or recipient is not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'An operation failed because it depends on one or more records that were required but not found.',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );

      mockPrismaService.transaction.create.mockRejectedValue(prismaError);

      await expect(
        service.create({
          senderId: 'invalid-sender-id',
          recipientId: 'invalid-recipient-id',
          amount: new Decimal(100),
        }),
      ).rejects.toThrow(
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

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        skip: params.skip,
        take: params.take,
        cursor: undefined,
        where: params.where,
        orderBy: undefined,
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('findOne', () => {
    it('should return a transaction if found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      const result = await service.findOne({ id: '1' });

      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
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
