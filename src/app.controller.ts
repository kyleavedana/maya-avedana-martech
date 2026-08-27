import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @HttpCode(HttpStatus.OK)
  get(): void {}
}
