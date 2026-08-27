import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/users/users.service';
import { TransactionsService } from './../src/transactions/transactions.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsersService = {
    create: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: '1',
        ...dto,
      }),
    ),

    findAll: jest.fn().mockResolvedValue([
      {
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
      },
    ]),

    findOne: jest.fn().mockImplementation(({ id }) => {
      if (id === '1') {
        return Promise.resolve({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
        });
      }

      return Promise.resolve(null);
    }),

    update: jest.fn().mockImplementation(
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ({ where, data }: { where: { id: string }; data: any }) =>
        Promise.resolve({
          id: where.id,
          ...data,
        }),
    ),

    remove: jest.fn().mockImplementation(({ id }: { id: string }) =>
      Promise.resolve({
        id,
        username: 'johndoe',
      }),
    ),
  };

  const mockTransactionsService = {
    create: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: 'transaction-1',
        senderId: data.senderId,
        recipientId: data.recipientId,
        amount: data.amount,
      }),
    ),

    findAll: jest.fn().mockResolvedValue([
      {
        id: 'transaction-1',
        senderId: '1',
        recipientId: '2',
        amount: 200,
      },
    ]),

    findOne: jest.fn().mockResolvedValue(null),

    getDailyTransferLimitData: jest.fn().mockResolvedValue({
      cap: 50000,
      duration: 'daily',
      remaining: 50000,
      used: 0,
    }),

    getMonthlyTransferLimitData: jest.fn().mockResolvedValue({
      cap: 500000,
      duration: 'monthly',
      remaining: 500000,
      used: 0,
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(TransactionsService)
      .useValue(mockTransactionsService)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/api/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto = {
        username: 'johndoe',
        email: 'john@example.com',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            ...createUserDto,
          });
        });
    });
  });

  describe('/api/users (GET)', () => {
    it('should retrieve users with optional query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .query({
          skip: 0,
          take: 10,
          orderBy: 'username',
          order: 'asc',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: '1',
              username: 'johndoe',
              email: 'john@example.com',
            },
          ]);

          expect(mockUsersService.findAll).toHaveBeenCalledWith({
            skip: 0,
            take: 10,
            cursor: undefined,
            orderBy: {
              username: 'asc',
            },
          });
        });
    });
  });

  describe('/api/users/search (POST)', () => {
    it('should search users matching criteria', () => {
      const whereDto = {
        username: 'johndoe',
      };

      return request(app.getHttpServer())
        .post('/api/users/search')
        .query({
          skip: 0,
          take: 10,
        })
        .send(whereDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: '1',
              username: 'johndoe',
              email: 'john@example.com',
            },
          ]);

          expect(mockUsersService.findAll).toHaveBeenCalledWith({
            skip: 0,
            take: 10,
            cursor: undefined,
            where: whereDto,
            orderBy: undefined,
          });
        });
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should retrieve a single user by ID', () => {
      return request(app.getHttpServer())
        .get('/api/users/1')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            username: 'johndoe',
            email: 'john@example.com',
          });

          expect(mockUsersService.findOne).toHaveBeenCalledWith({
            id: '1',
          });
        });
    });
  });

  describe('/api/users/:id (PATCH)', () => {
    it('should update a user by ID', () => {
      const updateUserDto = {
        username: 'john_updated',
      };

      return request(app.getHttpServer())
        .patch('/api/users/1')
        .send(updateUserDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            username: 'john_updated',
          });

          expect(mockUsersService.update).toHaveBeenCalledWith({
            where: {
              id: '1',
            },
            data: updateUserDto,
          });
        });
    });
  });

  describe('/api/users/:id/transactions (GET)', () => {
    it('should retrieve user transactions', () => {
      return request(app.getHttpServer())
        .get('/api/users/1/transactions')
        .query({
          skip: 0,
          take: 10,
          orderBy: 'createdAt',
          order: 'desc',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: 'transaction-1',
              senderId: '1',
              recipientId: '2',
              amount: 200,
            },
          ]);

          expect(mockTransactionsService.findAll).toHaveBeenCalledWith({
            skip: 0,
            take: 10,
            cursor: undefined,
            orderBy: {
              createdAt: 'desc',
            },
            where: {
              OR: [
                {
                  senderId: '1',
                },
                {
                  recipientId: '1',
                },
              ],
            },
          });
        });
    });
  });

  describe('/api/users/:id/transactions/limit (GET)', () => {
    it('should retrieve the daily transaction limit', () => {
      return request(app.getHttpServer())
        .get('/api/users/1/transactions/limit')
        .query({
          duration: 'daily',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            cap: 50000,
            duration: 'daily',
            remaining: 50000,
            used: 0,
          });

          expect(
            mockTransactionsService.getDailyTransferLimitData,
          ).toHaveBeenCalledWith('1');
        });
    });

    it('should retrieve the monthly transaction limit', () => {
      return request(app.getHttpServer())
        .get('/api/users/1/transactions/limit')
        .query({
          duration: 'monthly',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            cap: 500000,
            duration: 'monthly',
            remaining: 500000,
            used: 0,
          });

          expect(
            mockTransactionsService.getMonthlyTransferLimitData,
          ).toHaveBeenCalledWith('1');
        });
    });
  });

  describe('/api/users/:id/transactions/send-money (POST)', () => {
    it('should process a send money request', () => {
      const body = {
        recipientId: '2',
        amount: 200,
      };

      return request(app.getHttpServer())
        .post('/api/users/1/transactions/send-money')
        .send(body)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 'transaction-1',
            senderId: '1',
            recipientId: '2',
            amount: 200,
          });

          expect(mockTransactionsService.create).toHaveBeenCalledWith({
            senderId: '1',
            recipientId: '2',
            amount: 200,
          });
        });
    });
  });
});
