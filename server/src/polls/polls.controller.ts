import { Controller, Post, Logger, Body } from '@nestjs/common';
import { CreatePollDto } from './dtos/create-poll.dto';
import { JoinPollDto } from './dtos/join-poll.dto';
import { PollsService } from './providers/polls.service';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  async create(
    @Body() createPollDto: CreatePollDto,
  ): Promise<typeof createPollDto> {
    Logger.log('Creating a new poll...');
    const result = await this.pollsService.createPoll(createPollDto);
    return result;
  }

  @Post('join')
  async join(@Body() joinPollDto: JoinPollDto): Promise<typeof joinPollDto> {
    Logger.log('Joining a poll...');
    const result = await this.pollsService.joinPoll(joinPollDto);
    return result;
  }

  @Post('rejoin')
  async rejoin(@Body() joinPollDto: JoinPollDto): Promise<typeof joinPollDto> {
    Logger.log('Rejoining a poll...');
    const result = await this.pollsService.rejoinPoll(joinPollDto);
    return result;
  }
}
