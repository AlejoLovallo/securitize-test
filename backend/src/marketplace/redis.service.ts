import { Injectable, OnModuleInit, Logger, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'

import { createClient } from 'redis'

config()

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: ReturnType<typeof createClient>
  private expirationTime: number

  private readonly logger = new Logger(RedisService.name)

  REDIS_KEY_NOT_EXISTS = -2
  REDIS_KEY_NO_EXPIRATION = -1

  constructor(private readonly configService: ConfigService) {
    const redisPassword = process.env['REDIS_PASSWORD'] ?? ''
    const redisHost = this.configService.get<string>('REDIS_HOST')
    const redisPort = this.configService.get<string>('REDIS_PORT')

    const redisURL =
      redisPassword !== ''
        ? `redis://${redisPassword}@${redisHost}:${redisPort}`
        : `redis://${redisHost}:${redisPort}`

    this.redisClient = createClient({
      url: redisURL,
    })

    this.expirationTime =
      this.configService.get<number>('REDIS_DEFAULT_EXPIRATION_TIME') ?? 9000000000000

    try {
      this.redisClient.connect()
    } catch (err) {
      throw new HttpException('Could not connect to Redis DB', 500)
    }
  }

  async setValue(key: string, value: any, ex?: number) {
    await this.redisClient.set(`${key}`, value, {
      EX: ex ?? this.expirationTime,
    })
  }

  async getValue(key: string) {
    return this.fetchValueOrFail(`${key}`, false)
  }

  async getValueOrThrow(key: string): Promise<any> {
    return this.fetchValueOrFail(`${key}`, true)
  }

  private async fetchValueOrFail(key: string, throwError?: boolean): Promise<any> {
    const value = await this.redisClient.get(key)

    const ttl = await this.redisClient.ttl(key)

    if (ttl === this.REDIS_KEY_NOT_EXISTS && throwError) {
      throw new Error(`Key does not exists or has expired - ${key}`)
    } else if (ttl === this.REDIS_KEY_NO_EXPIRATION) {
      this.logger.debug(`Key ${key} has no expiration...`)
      return value
    }

    return value
  }

  async onModuleInit() {
    this.logger.log('Redis service started...')
  }
}
