import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { InjectRedis } from '../../redis/redis.module';

@Injectable()
export class PollsRepository {
  /** Seconds a poll lives in Redis before it expires (POLL_DURATION). */
  private readonly ttl: number;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.ttl = parseInt(
      this.configService.get<string>('POLL_DURATION', '7200'),
    );
  }
}
