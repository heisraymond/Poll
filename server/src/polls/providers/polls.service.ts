import { Injectable } from '@nestjs/common';
import { JoinPollDto } from '../dtos/join-poll.dto';
import { CreatePollDto } from '../dtos/create-poll.dto';
import { createPollId, createUserId } from '../utils/ids';

@Injectable()
export class PollsService {
  async createPoll(createPollDto: CreatePollDto) {
    const pollId = createPollId();
    const userId = createUserId();

    return {
      pollId,
      userId,
      ...createPollDto,
    };
  }

  async joinPoll(joinPollDto: JoinPollDto) {
    const userId = createUserId();

    return {
      userId,
      ...joinPollDto,
    };
  }

  async rejoinPoll(joinPollDto: JoinPollDto) {
    return {
      ...joinPollDto,
    };
  }
}
