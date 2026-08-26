import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WhereUserDto } from './dto/where-user.dto';
import { OrderByUserDto } from './dto/orderby-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    summary:
      'Retrieve all users with optional pagination, filtering, and sorting',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'limit',
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
    name: 'where',
    required: false,
    type: WhereUserDto,
    description: 'Filter conditions (JSON object or string)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: OrderByUserDto,
    description: 'Sorting parameters (JSON object or string)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all matching users.',
  })
  findAll(
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('cursorId') cursorId?: string,
    @Query('where') where?: WhereUserDto,
    @Query('orderBy') orderBy?: OrderByUserDto,
  ) {
    return this.usersService.findAll({
      skip: offset ? +offset : undefined,
      take: limit ? +limit : undefined,
      cursor: cursorId ? { id: cursorId } : undefined,
      where,
      orderBy,
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User numeric ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove({ id });
  }
}
