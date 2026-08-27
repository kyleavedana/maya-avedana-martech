import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { WhereTransactionDto } from './dto/where-transaction.dto';
import { TransactionStatus } from '../generated/prisma/client';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransaction = {
    id: 'tx-123-abc',
    amount: 100.5,
    status: TransactionStatus.SUCCESS,
  };

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with properly parsed query params', async () => {
      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);

      const result = await controller.findAll(
        0,
        10,
        'cursor-1',
        'amount',
        'asc',
      );

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        cursor: { id: 'cursor-1' },
        orderBy: { amount: 'asc' },
      });
      expect(result).toEqual([mockTransaction]);
    });

    it('should pass undefined for missing optional query parameters', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        cursor: undefined,
        orderBy: undefined,
      });
    });
  });

  describe('search', () => {
    it('should call service.findAll with parsed params and where clause', async () => {
      const whereDto: WhereTransactionDto = {
        status: TransactionStatus.SUCCESS,
      };
      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);

      const result = await controller.search(
        0,
        10,
        'cursor-1',
        'createdAt',
        'desc',
        whereDto,
      );

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        cursor: { id: 'cursor-1' },
        where: whereDto,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockTransaction]);
    });

    it('should pass undefined for missing optional parameters during search', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);

      await controller.search();

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        cursor: undefined,
        where: undefined,
        orderBy: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should retrieve a single transaction by ID', async () => {
      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne('tx-123-abc');

      expect(mockTransactionsService.findOne).toHaveBeenCalledWith({
        id: 'tx-123-abc',
      });
      expect(result).toEqual(mockTransaction);
    });
  });
});
