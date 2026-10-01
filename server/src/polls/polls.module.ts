import { Module } from '@nestjs/common';
import { redisModule } from '../modules.config';
import { PollsController } from './polls.controller';
import { PollsService } from './providers/polls.service';

@Module({
  imports: [redisModule],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
