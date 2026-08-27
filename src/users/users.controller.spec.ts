import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WhereUserDto } from './dto/where-user.dto';
import { TransactionsModule } from '../transactions/transactions.module';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: '123-abc',
    username: 'johndoe',
    firstName: 'John',
    middleName: 'M',
    lastName: 'Doe',
    status: 'ACTIVE',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TransactionsModule],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'johndoe',
        firstName: 'john',
        lastName: 'doe',
        email: 'john@example.com',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with properly parsed query params', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll(
        0,
        10,
        'cursor-1',
        'username',
        'asc',
      );

      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        cursor: { id: 'cursor-1' },
        orderBy: { username: 'asc' },
      });
      expect(result).toEqual([mockUser]);
    });

    it('should pass undefined for missing optional query parameters', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        cursor: undefined,
        orderBy: undefined,
      });
    });
  });

  describe('search', () => {
    it('should call service.findAll with parsed params and where clause', async () => {
      const whereDto: WhereUserDto = { email: 'john@example.com' };
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.search(
        0,
        10,
        'cursor-1',
        'createdAt',
        'desc',
        whereDto,
      );

      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        cursor: { id: 'cursor-1' },
        where: whereDto,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single user by ID', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('123-abc');

      expect(mockUsersService.findOne).toHaveBeenCalledWith({ id: '123-abc' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Johnny' };
      const updatedUser = { ...mockUser, firstName: 'Johnny' };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('123-abc', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith({
        where: { id: '123-abc' },
        data: updateUserDto,
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
