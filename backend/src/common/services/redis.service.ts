import { Injectable, OnModuleInit, Logger, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'

import { createClient } from 'redis'

config()
export class RedisService implements OnModuleInit {
  private redisClient: ReturnType<typeof createClient>

  private readonly logger = new Logger(RedisService.name)

  REDIS_KEY_NOT_EXISTS = -2
  REDIS_KEY_NO_EXPIRATION = -1

  constructor(private readonly configService: ConfigService) {
    const redisUser = process.env['REDIS_USER'] ?? ''
    const redisPassword = process.env['REDIS_PASSWORD'] ?? ''
    const redisHost = this.configService.get<string>('REDIS_HOST')
    const redisPort = configService.get<string>('REDIS_PORT')

    const redisURL =
      redisUser !== ''
        ? `redis://${redisUser}:${redisPassword}@${redisHost}:${redisPort}`
        : `redis://${redisHost}:${redisPort}`

    this.redisClient = createClient({
      url: redisURL,
    })
    try {
      this.redisClient.connect()
    } catch (err) {
      throw new HttpException('Could not connect to Redis DB', 500)
    }
  }

  /** 
  async setValue(key: string, value: any, ex?: number) {
    await this.redisClient.set(`${MAGIC_PROXY_PARTNER_CONFIG_PREFIX}-${key}`, value, {
      EX: ex
        ? ex
        : (parseEnvVar(process.env)(NumberFromString, 'REDIS_DEFAULT_EXPIRATION_TIME') ??
          9000000000000),
    })
  }


  async getValue(key: string) {
    return this.fetchValueOrFail(`${MAGIC_PROXY_PARTNER_CONFIG_PREFIX}-${key}`, false)
  }


  async getValueOrThrow(key: string): Promise<any> {
    return this.fetchValueOrFail(`${MAGIC_PROXY_PARTNER_CONFIG_PREFIX}-${key}`, true)
  }


  private async fetchValueOrFail(key: string, throwError?: boolean): Promise<any> {
    const value = await this.redisClient.get(key)

    const ttl = await this.redisClient.ttl(key)

    if (ttl === this.REDIS_KEY_NOT_EXISTS && throwError) {
      throw new ErrorWithData('Key does not exists or has expired', ErrorCode.BadRequest, key)
    } else if (ttl === this.REDIS_KEY_NO_EXPIRATION) {
      this.loggerService.debug(`Key ${key} has no expiration...`)
      return value
    }

    return value
  }

  **/
  async onModuleInit() {
    this.logger.log('Redis service started...')
  }
}
