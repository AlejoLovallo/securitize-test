import { NestFactory } from '@nestjs/core'
import { config } from 'dotenv'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { AppModule } from './app.module'
import { writeFileSync } from 'fs'

async function bootstrap() {
  config()
  const logger = new Logger('SECURITIZE-MARKETPLACE-BACKEND')
  const port = process.env['PORT'] ?? 3000

  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  })

  logger.log('SERVICE STARTED...')

  const options = new DocumentBuilder()
    .setTitle('Securitize - Marketplace backend')
    .setDescription('Marketplace backend')
    .setVersion(process.env['VERSION'] ? process.env['VERSION'] : 'no-version')
    .addTag(process.env['VERSION'] ? process.env['VERSION'] : 'no-version')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, options)

  // Save OpenAPI spec in JSON format
  if (process.env['SAVE_SWAGGER'] === 'true') {
    writeFileSync('./swagger/openapi-spec.json', JSON.stringify(document, null, 2))
  }

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: '/api/docs.json',
  })

  app.enableVersioning({ type: VersioningType.URI })
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (error) =>
            `${error.property} has wrong value ${error.value}, ${Object.values(
              error.constraints ?? {},
            ).join(', ')}`,
        )
        throw new Error(messages.join(', '))
      },
    }),
  )

  app.enableCors()

  await app.listen(port)
  logger.log(`API LISTENING ON PORT ${port}`)
}

bootstrap()
