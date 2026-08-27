import { IsNumber } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/client';

export class GetTransactionLimitDto {
  duration!: 'daily' | 'monthly';
  @IsNumber({ maxDecimalPlaces: 2 })
  cap!: Decimal | number;
  @IsNumber({ maxDecimalPlaces: 2 })
  used!: Decimal | number;
  @IsNumber({ maxDecimalPlaces: 2 })
  remaining!: Decimal | number;
}
