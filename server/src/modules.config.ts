import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

/**
 * Configured modules shared across feature modules.
 * Import these instead of calling `registerAsync` in each module.
 */

/** Redis client configured from REDIS_HOST / REDIS_PORT. */
export const redisModule = RedisModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisModule');

    return {
      connectionOptions: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: parseInt(configService.get<string>('REDIS_PORT', '6379')),
      },
      onClientReady: (client) => {
        logger.log('Redis client ready');

        client.on('error', (err) => {
          logger.error('Redis client error', err);
        });

        client.on('connect', () => {
          logger.log(
            `Connected to Redis on ${client.options.host}:${client.options.port}`,
          );
        });
      },
    };
  },
});
