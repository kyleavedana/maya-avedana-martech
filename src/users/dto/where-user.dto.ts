import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, UserStatus } from '../../generated/prisma/client';

export class WhereUserDto implements Prisma.UserWhereInput {
  @ApiPropertyOptional({
    description: 'Logical AND conditions for user filtering',
    type: () => [WhereUserDto],
  })
  AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];

  @ApiPropertyOptional({
    description: 'Logical OR conditions for user filtering',
    type: () => [WhereUserDto],
  })
  OR?: Prisma.UserWhereInput[];

  @ApiPropertyOptional({
    description: 'Logical NOT conditions for user filtering',
    type: () => [WhereUserDto],
  })
  NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];

  @ApiPropertyOptional({
    description: 'Filter by unique user ID or filter object',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  id?: Prisma.StringFilter<'User'> | string;

  @ApiPropertyOptional({
    description: 'Filter by username',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  username?: Prisma.StringFilter<'User'> | string;

  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: UserStatus,
  })
  status?: Prisma.EnumUserStatusFilter<'User'> | UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by first name',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  firstName?: Prisma.StringFilter<'User'> | string;

  @ApiPropertyOptional({
    description: 'Filter by middle name',
    nullable: true,
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  middleName?: Prisma.StringNullableFilter<'User'> | string | null;

  @ApiPropertyOptional({
    description: 'Filter by last name',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  lastName?: Prisma.StringFilter<'User'> | string;

  @ApiPropertyOptional({
    description: 'Filter by email address',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  email?: Prisma.StringFilter<'User'> | string;

  @ApiPropertyOptional({
    description: 'Filter by phone number',
    nullable: true,
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  phoneNumber?: Prisma.StringNullableFilter<'User'> | string | null;

  @ApiPropertyOptional({
    description: 'Filter by creation date',
    oneOf: [{ type: 'string', format: 'date-time' }, { type: 'object' }],
  })
  createdAt?: Prisma.DateTimeFilter<'User'> | Date | string;

  @ApiPropertyOptional({
    description: 'Filter by last updated date',
    oneOf: [{ type: 'string', format: 'date-time' }, { type: 'object' }],
  })
  updatedAt?: Prisma.DateTimeFilter<'User'> | Date | string;

  @ApiPropertyOptional({
    description: 'Filter by transactions where the user is the sender',
    type: Object,
  })
  transactionsAsSender?: Prisma.TransactionListRelationFilter;

  @ApiPropertyOptional({
    description: 'Filter by transactions where the user is the recipient',
    type: Object,
  })
  transactionsAsRecipient?: Prisma.TransactionListRelationFilter;
}
