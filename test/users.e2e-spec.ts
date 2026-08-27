import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsersService = {
    create: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ id: '1', ...dto })),
    findAll: jest
      .fn()
      .mockResolvedValue([
        { id: '1', username: 'johndoe', email: 'john@example.com' },
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
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      ({ where, data }: { where: { id: string }; data: any }) =>
        Promise.resolve({ id: where.id, ...data }),
    ),
    remove: jest
      .fn()
      .mockImplementation(({ id }: { id: string }) =>
        Promise.resolve({ id, username: 'johndoe' }),
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
      const createUserDto = { username: 'johndoe', email: 'john@example.com' };

      return request(app.getHttpServer())
        .post('/users')
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

  describe('/users (GET)', () => {
    it('should retrieve users with optional query parameters', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({ skip: 0, take: 10, orderBy: 'username', order: 'asc' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            { id: '1', username: 'johndoe', email: 'john@example.com' },
          ]);
        });
    });
  });

  describe('/users/search (POST)', () => {
    it('should search users matching criteria', () => {
      const whereDto = { username: 'johndoe' };

      return request(app.getHttpServer())
        .post('/users/search')
        .query({ skip: 0, take: 10 })
        .send(whereDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([
            { id: '1', username: 'johndoe', email: 'john@example.com' },
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
          });
        });
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user by ID', () => {
      const updateUserDto = { username: 'john_updated' };

      return request(app.getHttpServer())
        .patch('/users/1')
        .send(updateUserDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            id: '1',
            username: 'john_updated',
          });
        });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
