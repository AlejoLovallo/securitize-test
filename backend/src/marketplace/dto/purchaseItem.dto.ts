import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class PurchaseItemDto {
  @IsInt()
  @IsNotEmpty()
  itemId: number

  @IsNotEmpty()
  @IsString()
  buyer: string

  @IsNotEmpty()
  @IsString()
  signature: string

  @IsOptional()
  @IsNumber()
  deadline?: number
}
