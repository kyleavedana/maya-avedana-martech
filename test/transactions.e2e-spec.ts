import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TransactionsService } from './../src/transactions/transactions.service';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication<App>;

  const mockTransactionsService = {
    create: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({ id: '1', status: 'PENDING', ...dto }),
      ),
    findAll: jest
      .fn()
      .mockResolvedValue([{ id: '1', amount: 100, status: 'COMPLETED' }]),
    findOne: jest.fn().mockImplementation(({ id }) => {
      if (id === '1') {
        return Promise.resolve({
          id: '1',
          amount: 100,
          status: 'COMPLETED',
        });
      }
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TransactionsService)
      .useValue(mockTransactionsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/transactions (GET)', () => {
    it('should retrieve all transactions with optional query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/transactions')
        .query({ skip: 0, take: 10, orderBy: 'amount', order: 'asc' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            { id: '1', amount: 100, status: 'COMPLETED' },
          ]);
        });
    });
  });

  describe('/api/transactions/search (POST)', () => {
    it('should search transactions matching criteria', () => {
      const whereDto = { status: 'COMPLETED' };

      return request(app.getHttpServer())
        .post('/api/transactions/search')
        .query({ skip: 0, take: 10 })
        .send(whereDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            { id: '1', amount: 100, status: 'COMPLETED' },
          ]);
        });
    });
  });

  describe('/api/transactions/:id (GET)', () => {
    it('should retrieve a single transaction by ID', () => {
      return request(app.getHttpServer())
        .get('/api/transactions/1')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            amount: 100,
            status: 'COMPLETED',
          });
        });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
