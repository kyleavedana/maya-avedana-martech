import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '../../generated/prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    description: 'Account status',
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
