import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Poll } from 'shared';
import { InjectRedis } from '../../redis/redis.module';
import { CreatePollData } from '../utils/types';

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
      this.configService.get<string>('POLL_DURATION', '1000'),
      10,
    );
  }

  async createPoll({
    pollID,
    topic,
    votesPerVoter,
    userID,
  }: CreatePollData): Promise<Poll> {
    const initialPoll: Poll = {
      id: pollID,
      topic,
      votesPerVoter,
      participants: {},
      adminID: userID,
    };

    this.logger.log(
      `Creating new poll: ${JSON.stringify(initialPoll)} with TTL ${this.ttl}`,
    );

    const key = `polls:${pollID}`;

    try {
      const results = await this.redis
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialPoll)],
          ['expire', key, String(this.ttl)],
        ])
        .exec();

      // MULTI reports per-command failures in its results instead of throwing.
      const failed = results.find(([err]) => err);
      if (failed) {
        throw failed[0];
      }

      return initialPoll;
    } catch (e) {
      this.logger.error(
        `Failed to add poll ${JSON.stringify(initialPoll)}\n${e}`,
      );
      throw new InternalServerErrorException();
    }
  }
}
