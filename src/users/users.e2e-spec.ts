import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsersService = {
    create: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({ id: '1', status: 'ACTIVE', ...dto }),
      ),
    findAll: jest.fn().mockResolvedValue([
      {
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        status: 'ACTIVE',
      },
    ]),
    findOne: jest.fn().mockImplementation(({ id }) => {
      if (id === '1') {
        return Promise.resolve({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          status: 'ACTIVE',
        });
      }
      return Promise.resolve(null);
    }),
    update: jest.fn().mockImplementation(
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ({ where, data }: { where: { id: string }; data: any }) => {
        if (where.id === '1') {
          return Promise.resolve({
            id: '1',
            username: 'johndoe',
            email: 'john@example.com',
            status: 'ACTIVE',
            ...data,
          });
        }
        return Promise.resolve(null);
      },
    ),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto = {
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            status: 'ACTIVE',
            ...createUserDto,
          });
        });
    });
  });

  describe('/users (GET)', () => {
    it('should retrieve all users with optional query parameters', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({
          skip: 0,
          take: 10,
          cursorId: '1',
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
              status: 'ACTIVE',
            },
          ]);
        });
    });
  });

  describe('/users/search (POST)', () => {
    it('should search users matching criteria', () => {
      const whereDto = { status: 'ACTIVE', username: 'johndoe' };

      return request(app.getHttpServer())
        .post('/users/search')
        .query({
          skip: 0,
          take: 10,
          cursorId: '1',
          orderBy: 'createdAt',
          order: 'desc',
        })
        .send(whereDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: '1',
              username: 'johndoe',
              email: 'john@example.com',
              status: 'ACTIVE',
            },
          ]);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should retrieve a single user by ID', () => {
      return request(app.getHttpServer())
        .get('/users/1')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            username: 'johndoe',
            email: 'john@example.com',
            status: 'ACTIVE',
          });
        });
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user by ID', () => {
      const updateUserDto = { firstName: 'Jane' };

      return request(app.getHttpServer())
        .patch('/users/1')
        .send(updateUserDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            username: 'johndoe',
            email: 'john@example.com',
            status: 'ACTIVE',
            ...updateUserDto,
          });
        });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
