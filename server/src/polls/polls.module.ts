import { Module } from '@nestjs/common';
import { redisModule } from '../modules.config';
import { PollsController } from './polls.controller';
import { PollsService } from './providers/polls.service';
import { PollsRepository } from './repository/polls.repository';

@Module({
  imports: [redisModule],
  controllers: [PollsController],
  providers: [PollsService, PollsRepository],
})
export class PollsModule {}
