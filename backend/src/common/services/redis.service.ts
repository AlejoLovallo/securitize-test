import { Injectable, OnModuleInit, Inject } from '@nestjs/common'
import * as t from 'io-ts'
import { config } from 'dotenv'

import { NumberFromString } from 'io-ts-types'
import { createClient } from 'redis'

config()
@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: ReturnType<typeof createClient>

  REDIS_KEY_NOT_EXISTS = -2
  REDIS_KEY_NO_EXPIRATION = -1

  constructor(@Inject(LoggerServiceKey) private readonly loggerService: LoggerService) {
    const redisUser = process.env['REDIS_USER'] ?? ''
    const redisPassword = process.env['REDIS_PASSWORD'] ?? ''
    const redisHost = parseEnvVar(process.env)(t.string, 'REDIS_HOST')
    const redisPort = parseEnvVar(process.env)(t.string, 'REDIS_PORT')

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
      throw new ErrorWithData('Could not connect to Redis DB', ErrorCode.Unknown, err)
    }
  }

  /**
   * @dev Set value in redis db
   * @param key Key value
   * @param value Value to set
   * @param ex (optional) expiration time of the value
   */
  async setValue(key: string, value: any, ex?: number) {
    await this.redisClient.set(`${MAGIC_PROXY_PARTNER_CONFIG_PREFIX}-${key}`, value, {
      EX: ex
        ? ex
        : (parseEnvVar(process.env)(NumberFromString, 'REDIS_DEFAULT_EXPIRATION_TIME') ??
          9000000000000),
    })
  }

  /**
   * @dev Get value from redis db
   * @param key
   * @returns
   */
  async getValue(key: string) {
    return this.fetchValueOrFail(`${MAGIC_PROXY_PARTNER_CONFIG_PREFIX}-${key}`, false)
  }

  /**
   * @dev Retrieve value from Redis and throw an error if not present.
   * @param key Key to retrieve value
   * @returns {any}
   */
  async getValueOrThrow(key: string): Promise<any> {
    return this.fetchValueOrFail(`${MAGIC_PROXY_PARTNER_CONFIG_PREFIX}-${key}`, true)
  }

  /**
   * @dev Get value from db and optionally throw and error if It is not present.
   * @param key Key to retrieve value
   * @param throwError whether to throw on error or not
   * @returns {any}
   */
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

  async onModuleInit() {
    this.loggerService.info('Redis service started...')
  }
}
