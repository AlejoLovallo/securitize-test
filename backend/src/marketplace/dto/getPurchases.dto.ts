import { IsNumber, IsOptional, IsString } from 'class-validator'

export class GetPurchasesHistoryDto {
  @IsOptional()
  @IsNumber()
  fromBlock?: number

  @IsOptional()
  @IsString()
  toBlock?: string
}
