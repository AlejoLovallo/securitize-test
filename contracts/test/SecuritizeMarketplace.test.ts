import { expect } from 'chai'
import { ethers, getNamedAccounts } from 'hardhat'
import { marketplaceFixture } from './fixture'
import { Signer } from 'ethers'
import { MockERC20, SecuritizeMarketplace } from '../typechain-types'

describe('Securitize Marketplace', () => {
  let deployer: Signer
  let user1: Signer
  let user2: Signer
  let invalidSigner: Signer
  let MockToken1: MockERC20
  let MockToken2: MockERC20
  let SecuritizeMarketplace: SecuritizeMarketplace

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    user1 = signers[1]
    user2 = signers[2]
    invalidSigner = signers[18]
  })

  beforeEach(async () => {
    const { MockToken1Contract, MockToken2Contract, SecuritizeMarketplaceContract } =
      await marketplaceFixture()
    MockToken1 = MockToken1Contract
    MockToken2 = MockToken2Contract
    SecuritizeMarketplace = SecuritizeMarketplaceContract
  })

  it('Correct initialization', async () => {
    // GIVEN
  })

  it('List item', async () => {})

  it('Purchase item', async () => {})

  it('Withdraw funds', async () => {})
})
