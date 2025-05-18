import { IsOptional, IsInt, IsString, IsArray, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiResponseProperty } from '@nestjs/swagger'

export class GetItemsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10

  @IsOptional()
  @IsString()
  token?: string

  @IsOptional()
  @IsString()
  seller?: string

  @IsOptional()
  @IsString()
  forceUpdate?: boolean
}

export class GetItemsResponse {
  @ApiResponseProperty()
  @IsArray()
  @IsString({ each: true })
  items: string[]

  @ApiResponseProperty()
  @IsArray()
  decodedItems: Array<{
    id: string
    token: string
    seller: string
    amount: string
    price: string
  }>

  @ApiResponseProperty()
  @IsInt()
  total: number

  @ApiResponseProperty()
  @IsInt()
  page: number

  @ApiResponseProperty()
  @IsInt()
  offset: number
}
