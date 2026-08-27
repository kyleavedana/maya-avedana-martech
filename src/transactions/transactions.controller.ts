import {
  Controller,
  Get,
  Post,
  Body,
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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WhereTransactionDto } from './dto/where-transaction.dto';

const orderByEnum = [
  'id',
  'amount',
  'status',
  'createdAt',
  'updatedAt',
] as const;
const orderEnum = ['asc', 'desc'] as const;

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
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
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all transactions with optional pagination',
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
    description: 'Transaction ID for cursor-based pagination',
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
    description: 'Return transactions.',
  })
  findAll(
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
      orderBy: orderBy ? { [orderBy]: order } : undefined,
    });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search transactions with optional pagination',
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
    description: 'Transaction ID for cursor-based pagination',
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
  @ApiBody({ type: WhereTransactionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all matching transactions.',
  })
  search(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: string,
    @Query('orderBy') orderBy?: (typeof orderByEnum)[number],
    @Query('order') order?: (typeof orderEnum)[number],
    @Body() where?: WhereTransactionDto,
  ) {
    return this.transactionsService.findAll({
      skip: skip !== undefined ? +skip : undefined,
      take: take !== undefined ? +take : undefined,
      cursor: cursorId ? { id: cursorId } : undefined,
      where,
      orderBy: orderBy ? { [orderBy]: order } : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transaction found.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found.',
  })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne({ id });
  }
}
