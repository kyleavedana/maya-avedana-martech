import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, TransactionStatus } from '../../generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export class WhereTransactionDto implements Prisma.TransactionWhereInput {
  @ApiPropertyOptional({
    description: 'Logical AND conditions for transaction filtering',
    type: () => [WhereTransactionDto],
  })
  AND?: Prisma.TransactionWhereInput | Prisma.TransactionWhereInput[];

  @ApiPropertyOptional({
    description: 'Logical OR conditions for transaction filtering',
    type: () => [WhereTransactionDto],
  })
  OR?: Prisma.TransactionWhereInput[];

  @ApiPropertyOptional({
    description: 'Logical NOT conditions for transaction filtering',
    type: () => [WhereTransactionDto],
  })
  NOT?: Prisma.TransactionWhereInput | Prisma.TransactionWhereInput[];

  @ApiPropertyOptional({ description: 'Filter by transaction ID' })
  id?: Prisma.StringFilter<'Transaction'> | string;

  @ApiPropertyOptional({ description: 'Filter by sender user ID' })
  senderId?: Prisma.StringFilter<'Transaction'> | string;

  @ApiPropertyOptional({ description: 'Filter by recipient user ID' })
  recipientId?: Prisma.StringFilter<'Transaction'> | string;

  @ApiPropertyOptional({ description: 'Filter by transaction amount' })
  amount?: Prisma.DecimalFilter<'Transaction'> | Decimal;

  @ApiPropertyOptional({
    description: 'Filter by transaction status',
    enum: TransactionStatus,
  })
  status?:
    Prisma.EnumTransactionStatusFilter<'Transaction'> | TransactionStatus;

  @ApiPropertyOptional({
    description: 'Filter by failure reason',
    nullable: true,
  })
  failureReason?: Prisma.StringNullableFilter<'Transaction'> | string | null;

  @ApiPropertyOptional({
    description: 'Filter by creation date',
    oneOf: [{ type: 'string', format: 'date-time' }, { type: 'object' }],
  })
  createdAt?: Prisma.DateTimeFilter<'Transaction'> | Date | string;

  @ApiPropertyOptional({
    description: 'Filter by last updated date',
    oneOf: [{ type: 'string', format: 'date-time' }, { type: 'object' }],
  })
  updatedAt?: Prisma.DateTimeFilter<'Transaction'> | Date | string;
}
