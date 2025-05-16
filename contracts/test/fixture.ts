import { ethers, deployments, getNamedAccounts } from 'hardhat'
import { SecuritizeMarketplace } from '../typechain-types'
import { deployMockERC20 } from './utils'

export const marketplaceFixture = deployments.createFixture(async () => {
  await deployments.fixture(['V1'])

  const { deployer } = await getNamedAccounts()

  const SecuritizeMarketplaceContract = await ethers.getContract<SecuritizeMarketplace>(
    'SecuritizeMarketplace',
    deployer,
  )

  const MockToken1Contract = await deployMockERC20({ name: 'MOCKTOKEN', symbol: 'MERC20' })
  const MockToken2Contract = await deployMockERC20({ name: 'MOCKTOKEN', symbol: 'MERC20' })

  return {
    SecuritizeMarketplaceContract,
    MockToken1Contract,
    MockToken2Contract,
  }
})
