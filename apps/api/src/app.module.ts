import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FormsModule } from './forms/forms.module';
import { FormVersionsModule } from './form-versions/form-versions.module';
import { ResponsesModule } from './responses/responses.module';
import { AntiSpamModule } from './anti-spam/anti-spam.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FormsModule,
    FormVersionsModule,
    ResponsesModule,
    AntiSpamModule,
  ],
})
export class AppModule {}
