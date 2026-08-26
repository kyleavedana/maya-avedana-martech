import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '../../generated/prisma/client';

export class OrderByUserDto implements Prisma.UserOrderByWithRelationInput {
  @ApiPropertyOptional({
    description: 'Sort order for ID',
    enum: Prisma.SortOrder,
  })
  id?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for username',
    enum: Prisma.SortOrder,
  })
  username?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for user status',
    enum: Prisma.SortOrder,
  })
  status?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for first name',
    enum: Prisma.SortOrder,
  })
  firstName?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for middle name',
    oneOf: [
      { type: 'string', enum: ['asc', 'desc'] },
      {
        type: 'object',
        properties: {
          sort: { type: 'string', enum: ['asc', 'desc'] },
          nulls: { type: 'string', enum: ['first', 'last'] },
        },
      },
    ],
  })
  middleName?: Prisma.SortOrderInput | Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for last name',
    enum: Prisma.SortOrder,
  })
  lastName?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for email address',
    enum: Prisma.SortOrder,
  })
  email?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for phone number',
    oneOf: [
      { type: 'string', enum: ['asc', 'desc'] },
      {
        type: 'object',
        properties: {
          sort: { type: 'string', enum: ['asc', 'desc'] },
          nulls: { type: 'string', enum: ['first', 'last'] },
        },
      },
    ],
  })
  phoneNumber?: Prisma.SortOrderInput | Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for creation timestamp',
    enum: Prisma.SortOrder,
  })
  createdAt?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort order for last updated timestamp',
    enum: Prisma.SortOrder,
  })
  updatedAt?: Prisma.SortOrder;

  @ApiPropertyOptional({
    description: 'Sort relation for transactions where the user is sender',
    type: Object,
  })
  transactionsAsSender?: Prisma.TransactionOrderByRelationAggregateInput;

  @ApiPropertyOptional({
    description: 'Sort relation for transactions where the user is recipient',
    type: Object,
  })
  transactionsAsRecipient?: Prisma.TransactionOrderByRelationAggregateInput;
}
