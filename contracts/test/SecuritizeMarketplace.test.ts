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
  let securitizeMarketplaceAddress: string
  let mockToken1Address: string
  let mockToken2Address: string

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
    securitizeMarketplaceAddress = await SecuritizeMarketplace.getAddress()
    mockToken1Address = await MockToken1.getAddress()
    mockToken2Address = await MockToken2.getAddress()
  })

  it('List item', async () => {
    const token = mockToken1Address
    const amount = 100
    const price = ethers.parseEther('0.1')

    await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
    await SecuritizeMarketplace.connect(deployer).listItem(token, price, amount)

    //     expect(item.token).to.equal(token)
    //     expect(item.price).to.equal(price)
    //     expect(item.amount).to.equal(amount)
  })

  xit('List items batch', async () => {})
  xit('Purchase item', async () => {})
  xit('Withdraw funds', async () => {})
})
