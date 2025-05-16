import { ethers } from 'hardhat'

interface IDeployMockERC20 {
  name?: string
  symbol?: string
  decimals?: string
}

export const deployMockERC20 = async ({
  name = 'MOCKERC20',
  symbol = 'MERC20',
  decimals = '18',
}: IDeployMockERC20) => {
  const MockERC20Factory = await ethers.getContractFactory('MockERC20')

  const MockERC20Token = await MockERC20Factory.deploy(
    name,
    symbol,
    '5000000000000000000000000',
    decimals,
  )

  return MockERC20Token
}
