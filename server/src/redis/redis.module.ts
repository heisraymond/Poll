import {
  DynamicModule,
  FactoryProvider,
  Inject,
  Module,
  ModuleMetadata,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import IORedis from 'ioredis';

/**
 * Injection token for the shared Redis client.
 *
 * Prefer {@link InjectRedis} for constructor injection.
 */
export const IORedisKey = 'IORedis';

/**
 * Injects the shared Redis client.
 *
 * Wraps `@Inject(IORedisKey)` with the standard `ParameterDecorator` type:
 * NestJS 8's `@Inject` typing is rejected on constructor parameters by
 * newer TypeScript versions (TS1239), even though it works at runtime.
 *
 * @example
 * constructor(@InjectRedis() private readonly redis: IORedis.Redis) {}
 */
export const InjectRedis = (): ParameterDecorator =>
  Inject(IORedisKey) as ParameterDecorator;

/**
 *
 * Options used to create the Redis client.
 */
export type RedisModuleOptions = {
  /** Passed directly to `new IORedis()` (host, port, password, ...). */
  connectionOptions: IORedis.RedisOptions;
  /** Called once with the new client, e.g. to attach event listeners. */
  onClientReady?: (client: IORedis.Redis) => void;
};

/**
 * Options for {@link RedisModule.registerAsync}.
 *
 * Follows Nest's standard async-config pattern: `useFactory` receives the
 * providers listed in `inject`, which must be available from `imports`.
 */
export type RedisModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

/**
 * Provides a single, shared ioredis client under {@link IORedisKey}.
 *
 * Don't import this class directly; import the module returned by
 * {@link RedisModule.registerAsync} (see `modules.config.ts`).
 */
@Module({})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Closes the Redis connection when the app stops, so in-flight commands
   * finish and the server doesn't hang on an open socket.
   * Requires `app.enableShutdownHooks()` in `main.ts`.
   */
  async onApplicationShutdown(): Promise<void> {
    const client = this.moduleRef.get<IORedis.Redis>(IORedisKey);
    await client.quit();
  }

  /**
   * Builds a RedisModule whose client is configured at runtime,
   * e.g. from `ConfigService`.
   */
  static async registerAsync({
    useFactory,
    imports = [],
    inject = [],
  }: RedisModuleAsyncOptions): Promise<DynamicModule> {
    const redisProvider: FactoryProvider<Promise<IORedis.Redis>> = {
      provide: IORedisKey,
      // Nest resolves `inject` and passes the results in as `args`.
      useFactory: async (...args: any[]) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);

        const client = new IORedis(connectionOptions);

        onClientReady?.(client);

        return client;
      },
      inject,
    };

    return {
      module: RedisModule,
      imports,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
