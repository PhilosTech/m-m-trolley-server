import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const adapter = new PrismaPg(connectionString);
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    const row = await this.bookingPolicyState.findUnique({ where: { id: 1 } });
    if (!row) {
      await this.bookingPolicyState.create({
        data: {
          id: 1,
          isGlobalLocked: false,
          lockedLocationIds: [],
        },
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
