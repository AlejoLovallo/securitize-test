import { IsOptional, IsInt, IsString } from 'class-validator'
import { Type } from 'class-transformer'

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
  sortBy?: string

  @IsOptional()
  @IsString()
  token?: string

  @IsOptional()
  @IsString()
  seller?: string
}
