import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionStatus } from '../../generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateTransactionDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'UUID of the sender user',
  })
  @IsUUID()
  @IsNotEmpty()
  senderId!: string;

  @ApiProperty({
    example: 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22',
    description: 'UUID of the recipient user',
  })
  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({
    example: 99.99,
    description: 'Transaction amount (up to 2 decimal places)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  amount!: Decimal;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.SUCCESS,
    description: 'Status of the transaction',
    required: false,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({
    example: 'Insufficient funds',
    description: 'Reason for failure if status is FAILED',
    required: false,
  })
  @IsString()
  @IsOptional()
  failureReason?: string;
}
