import { Module } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './providers/polls.service';

@Module({
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
