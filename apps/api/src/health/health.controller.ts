import { Controller, Get } from '@nestjs/common';
import type { ApiHealthResponse } from '@repo/shared-types';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): ApiHealthResponse {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }
}
