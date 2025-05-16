import { IsOptional, IsString } from 'class-validator'

export class GetPurchasesHistoryDto {
  @IsOptional()
  @IsString()
  fromBlock?: string

  @IsOptional()
  @IsString()
  toBlock?: string
}
