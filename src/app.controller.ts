import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';

@Controller('api')
export class AppController {
  constructor() {}

  @Get()
  @HttpCode(HttpStatus.OK)
  get(): void {}
}
