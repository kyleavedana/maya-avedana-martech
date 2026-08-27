import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateTransactionNoSenderDto {
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
}
