import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WhereUserDto } from './dto/where-user.dto';
import { CreateTransactionNoSenderDto } from '../transactions/dto/create-transaction-no-sender.dto';

const orderByEnum = [
  'id',
  'username',
  'firstName',
  'middleName',
  'lastName',
  'status',
  'email',
  'phoneNumber',
  'createdAt',
  'updatedAt',
] as const;
const orderEnum = ['asc', 'desc'] as const;

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid body input.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all users with optional pagination',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'cursorId',
    required: false,
    type: String,
    description: 'User ID for cursor-based pagination',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: 'string',
    enum: orderByEnum,
    description: 'Sorting key',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: 'string',
    enum: orderEnum,
    description: 'Sort',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return users.',
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: string,
    @Query('orderBy') orderBy?: (typeof orderByEnum)[number],
    @Query('order') order?: (typeof orderEnum)[number],
  ) {
    return this.usersService.findAll({
      skip: skip !== undefined ? +skip : undefined,
      take: take !== undefined ? +take : undefined,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: orderBy ? { [orderBy]: order } : undefined,
    });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search users with optional pagination',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'cursorId',
    required: false,
    type: String,
    description: 'User ID for cursor-based pagination',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: 'string',
    enum: orderByEnum,
    description: 'Sorting key',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: 'string',
    enum: orderEnum,
    description: 'Sort',
  })
  @ApiBody({ type: WhereUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all matching users.',
  })
  search(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: string,
    @Query('orderBy') orderBy?: (typeof orderByEnum)[number],
    @Query('order') order?: (typeof orderEnum)[number],
    @Body() where?: WhereUserDto,
  ) {
    return this.usersService.findAll({
      skip: skip !== undefined ? +skip : undefined,
      take: take !== undefined ? +take : undefined,
      cursor: cursorId ? { id: cursorId } : undefined,
      where,
      orderBy: orderBy ? { [orderBy]: order } : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully updated.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update({
      where: { id },
      data: updateUserDto,
    });
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: "Retrieve all user's transactions with optional pagination",
  })
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'cursorId',
    required: false,
    type: String,
    description: 'User ID for cursor-based pagination',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: 'string',
    enum: orderByEnum,
    description: 'Sorting key',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: 'string',
    enum: orderEnum,
    description: 'Sort',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return users.',
  })
  findAllTransactions(
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: string,
    @Query('orderBy') orderBy?: (typeof orderByEnum)[number],
    @Query('order') order?: (typeof orderEnum)[number],
  ) {
    return this.transactionsService.findAll({
      skip: skip !== undefined ? +skip : undefined,
      take: take !== undefined ? +take : undefined,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: orderBy ? { [orderBy]: order } : { createdAt: 'desc' },
      where: { OR: [{ senderId: id }, { recipientId: id }] },
    });
  }

  @Get(':id/transactions/limit')
  @ApiOperation({
    summary: "Retrieve all user's transactions with optional pagination",
  })
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiQuery({
    name: 'duration',
    required: true,
    enum: ['daily', 'monthly'],
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return daily limit.',
  })
  getDailyTransactionLimit(
    @Param('id') id: string,
    @Query('duration') duration: 'daily' | 'monthly',
  ) {
    if (duration === 'daily') {
      return this.transactionsService.getDailyTransferLimitData(id);
    } else if (duration === 'monthly') {
      return this.transactionsService.getMonthlyTransferLimitData(id);
    }
  }

  @Post(':id/transactions/send-money')
  @ApiOperation({ summary: 'Send money' })
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The transaction has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid body input.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sender or Recipient user not found',
  })
  createTransaction(
    @Param('id') id: string,
    @Body() data: CreateTransactionNoSenderDto,
  ) {
    return this.transactionsService.create({
      senderId: id,
      ...data,
    });
  }
}
