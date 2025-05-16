import { IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator'

export class ListItemDto {
  @IsNotEmpty()
  @IsString()
  token: string

  @IsNotEmpty()
  @IsString()
  seller: string

  @IsNotEmpty()
  @IsNumber()
  price: number

  @IsNotEmpty()
  @IsNumber()
  amount: number

  @IsNotEmpty()
  @IsString()
  signature: string

  @IsOptional()
  @IsNumber()
  deadline?: number
}
