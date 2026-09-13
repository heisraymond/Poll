import { customAlphabet, nanoid } from 'nanoid';

export const createPollId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  10,
);

export const createUserId = () => nanoid();
export const createNominationId = () => nanoid(8);
