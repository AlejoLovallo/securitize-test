import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class WithdrawFundsDto {
  @IsNotEmpty()
  @IsString()
  seller: string

  @IsNotEmpty()
  @IsString()
  signature: string

  @IsOptional()
  @IsNumber()
  deadline?: number
}
