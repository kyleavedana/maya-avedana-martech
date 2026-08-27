import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { User } from '../generated/prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
  } as User;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createInput = {
      username: 'johndoe',
      firstName: 'john',
      lastName: 'doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
    };

    it('should create a new user when no conflicts exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createInput);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: createInput.username },
            { email: createInput.email },
            { phoneNumber: createInput.phoneNumber },
          ],
        },
        select: { username: true, email: true, phoneNumber: true },
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createInput,
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if username is taken', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        username: createInput.username,
        email: 'other@example.com',
        phoneNumber: '0000000000',
      });

      await expect(service.create(createInput)).rejects.toThrow(
        new ConflictException('Username is already taken.'),
      );
    });

    it('should throw ConflictException if email is registered', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        username: 'otheruser',
        email: createInput.email,
        phoneNumber: '0000000000',
      });

      await expect(service.create(createInput)).rejects.toThrow(
        new ConflictException('Email is already registered.'),
      );
    });

    it('should throw ConflictException if phone number is in use', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        username: 'otheruser',
        email: 'other@example.com',
        phoneNumber: createInput.phoneNumber,
      });

      await expect(service.create(createInput)).rejects.toThrow(
        new ConflictException('Phone number is already in use.'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const params = { skip: 0, take: 10 };
      const result = await service.findAll(params);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(params);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne({ id: '1' });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne({ id: '999' });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateParams = {
        where: { id: '1' },
        data: { username: 'johnupdated' },
      };
      const updatedUser = { ...mockUser, username: 'johnupdated' };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(updateParams);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(updateParams);
      expect(result).toEqual(updatedUser);
    });
  });
});
