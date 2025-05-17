import { expect } from 'chai'
import { ethers, getNamedAccounts } from 'hardhat'
import { marketplaceFixture } from './fixture'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { MockERC20, SecuritizeMarketplace } from '../typechain-types'
import { verifySignature } from './utils'

describe('Securitize Marketplace', () => {
  let deployer: HardhatEthersSigner
  let user1: HardhatEthersSigner
  let user2: HardhatEthersSigner
  let invalidSigner: HardhatEthersSigner
  let MockToken1: MockERC20
  let MockToken2: MockERC20
  let SecuritizeMarketplace: SecuritizeMarketplace
  let securitizeMarketplaceAddress: string
  let mockToken1Address: string
  let mockToken2Address: string
  let deployerAddress: string
  let user1Address: string
  let user2Address: string

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    user1 = signers[1]
    user2 = signers[2]
    invalidSigner = signers[18]
    deployerAddress = await deployer.getAddress()
    user1Address = await user1.getAddress()
    user2Address = await user2.getAddress()
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

  describe('List Item', () => {
    it('Should list a single item correctly', async () => {
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await expect(SecuritizeMarketplace.connect(deployer).listItem(token, price, amount))
        .to.emit(SecuritizeMarketplace, 'ItemListed')
        .withArgs(token, deployerAddress, amount, price)

      const itemIds = await SecuritizeMarketplace.itemsIds()
      expect(itemIds.length).to.equal(1)

      const item = await SecuritizeMarketplace.listedItems(itemIds[0])
      expect(item.token).to.equal(token)
      expect(item.seller).to.equal(deployerAddress)
      expect(item.amount).to.equal(amount)
      expect(item.price).to.equal(price)
      expect(item.active).to.equal(true)

      const seller = await SecuritizeMarketplace.sellers(deployerAddress)
      expect(seller.activeListedItems).to.equal(1n)
      expect(seller.totalListedItems).to.equal(1n)
      expect(seller.totalSoldItems).to.equal(0n)
      expect(seller.active).to.equal(true)
    })

    it('Should revert if token amount is 0', async () => {
      const token = mockToken1Address
      const amount = 0n
      const price = ethers.parseEther('0.1')

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await expect(
        SecuritizeMarketplace.connect(deployer).listItem(token, price, amount),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidItemAmount')
    })

    it('Should revert if price is 0', async () => {
      const token = mockToken1Address
      const amount = 100n
      const price = 0n

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await expect(
        SecuritizeMarketplace.connect(deployer).listItem(token, price, amount),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidItemPrice')
    })
  })

  describe('List Items Batch', () => {
    it('Should list multiple items correctly', async () => {
      const tokens = [mockToken1Address, mockToken2Address]
      const amounts = [100n, 200n]
      const prices = [ethers.parseEther('0.1'), ethers.parseEther('0.2')]

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await MockToken2.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)

      await expect(SecuritizeMarketplace.connect(deployer).listBatchItems(tokens, prices, amounts))
        .to.emit(SecuritizeMarketplace, 'ItemListed')
        .withArgs(tokens[0], deployerAddress, amounts[0], prices[0])
        .to.emit(SecuritizeMarketplace, 'ItemListed')
        .withArgs(tokens[1], deployerAddress, amounts[1], prices[1])

      const itemIds = await SecuritizeMarketplace.itemsIds()
      expect(itemIds.length).to.equal(2)

      const seller = await SecuritizeMarketplace.sellers(deployerAddress)
      expect(seller.activeListedItems).to.equal(2n)
      expect(seller.totalListedItems).to.equal(2n)
      expect(seller.totalSoldItems).to.equal(2n)
      expect(seller.active).to.equal(true)
    })

    it('Should revert if arrays have different lengths', async () => {
      const tokens = [mockToken1Address]
      const amounts = [100n, 200n]
      const prices = [ethers.parseEther('0.1')]

      await expect(
        SecuritizeMarketplace.connect(deployer).listBatchItems(tokens, prices, amounts),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidListingBatchLengths')
    })
  })

  describe('List Item With Signature', () => {
    it('Should list item with valid signature', async () => {
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')
      const deadline = (await ethers.provider.getBlock('latest'))!.timestamp + 3600
      // Obtener el nonce del deployer, no de user1
      const nonce = (await SecuritizeMarketplace.sellers(deployerAddress)).signedNonce
      const chainId = (await ethers.provider.getNetwork()).chainId

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, amount)

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId,
        verifyingContract: securitizeMarketplaceAddress,
      }

      const types = {
        ListItem: [
          { name: 'tokenAddress', type: 'address' },
          { name: 'priceInWei', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        tokenAddress: token,
        priceInWei: price,
        amount: amount,
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await deployer.signTypedData(domain, types, value)

      const isValid = await verifySignature(domain, types, value, signature, deployerAddress)
      console.log('Signature valid?', isValid)

      // Usar expect en lugar de try-catch para ver el error completo
      await expect(
        SecuritizeMarketplace.connect(deployer).ListItemWithSig(
          signature,
          deployerAddress,
          token, // tokenAddress
          price, // priceInWei
          amount,
          deadline,
        ),
      )
        .to.emit(SecuritizeMarketplace, 'ItemListed')
        .withArgs(token, deployerAddress, amount, price)

      // Verificar el estado después de listar
      const itemIds = await SecuritizeMarketplace.itemsIds()
      const item = await SecuritizeMarketplace.listedItems(itemIds[0])
      expect(item.token).to.equal(token)
      expect(item.seller).to.equal(deployerAddress)
      expect(item.amount).to.equal(amount)
      expect(item.price).to.equal(price)
      expect(item.active).to.equal(true)
    })

    it('Should revert with invalid signature', async () => {
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const nonce = 0n

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: securitizeMarketplaceAddress,
      }

      const types = {
        ListItem: [
          { name: 'tokenAddress', type: 'address' },
          { name: 'priceInWei', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        tokenAddress: token,
        priceInWei: price,
        amount: amount,
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await invalidSigner.signTypedData(domain, types, value)

      await expect(
        SecuritizeMarketplace.connect(user1).ListItemWithSig(
          signature,
          deployerAddress,
          token,
          amount,
          price,
          deadline,
        ),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidSignature')
    })
  })

  describe('Purchase Item', () => {
    beforeEach(async () => {
      // List an item first
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await SecuritizeMarketplace.connect(deployer).listItem(token, price, amount)
    })

    it('Should purchase item correctly', async () => {
      const itemIds = await SecuritizeMarketplace.itemsIds()
      const itemId = itemIds[0]
      const item = await SecuritizeMarketplace.listedItems(itemId)

      await expect(SecuritizeMarketplace.connect(user1).purchaseItem(itemId, { value: item.price }))
        .to.emit(SecuritizeMarketplace, 'ItemPurchased')
        .withArgs(user1Address, item.token, item.amount, item.price)

      const seller = await SecuritizeMarketplace.sellers(deployerAddress)
      expect(seller.activeListedItems).to.equal(0n)
      expect(seller.totalSoldItems).to.equal(1n)
      expect(seller.balance).to.equal(item.price)
      expect(seller.pendingWithdrawals).to.equal(item.price)

      const updatedItem = await SecuritizeMarketplace.listedItems(itemId)
      expect(updatedItem.active).to.equal(false)

      const updatedIds = await SecuritizeMarketplace.itemsIds()
      expect(updatedIds.length).to.equal(0)
    })

    it('Should revert if payment amount is incorrect', async () => {
      const itemIds = await SecuritizeMarketplace.itemsIds()
      const itemId = itemIds[0]
      const item = await SecuritizeMarketplace.listedItems(itemId)

      await expect(
        SecuritizeMarketplace.connect(user1).purchaseItem(itemId, {
          value: item.price - 1n,
        }),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidPayment')
    })

    it('Should revert if item is inactive', async () => {
      const itemIds = await SecuritizeMarketplace.itemsIds()
      const itemId = itemIds[0]
      const item = await SecuritizeMarketplace.listedItems(itemId)

      // Purchase item first
      await SecuritizeMarketplace.connect(user1).purchaseItem(itemId, { value: item.price })

      // Try to purchase again
      await expect(
        SecuritizeMarketplace.connect(user2).purchaseItem(itemId, { value: item.price }),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidItemId')
    })
  })

  describe('Purchase Item With Signature', () => {
    beforeEach(async () => {
      // List an item first
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await SecuritizeMarketplace.connect(deployer).listItem(token, price, amount)
    })

    it('Should purchase item with valid signature', async () => {
      const itemIds = await SecuritizeMarketplace.itemsIds()
      const itemId = itemIds[0]
      const item = await SecuritizeMarketplace.listedItems(itemId)
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const nonce = await SecuritizeMarketplace.buyerNonces(user1Address)

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: securitizeMarketplaceAddress,
      }

      const types = {
        PurchaseItem: [
          { name: 'itemId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        itemId: itemId,
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await user1.signTypedData(domain, types, value)

      await expect(
        SecuritizeMarketplace.connect(user1).purchaseItemWithSig(
          itemId,
          user1Address,
          signature,
          deadline,
          {
            value: item.price,
          },
        ),
      )
        .to.emit(SecuritizeMarketplace, 'ItemPurchased')
        .withArgs(user1Address, item.token, item.amount, item.price)
    })

    it('Should revert with invalid signature', async () => {
      const itemIds = await SecuritizeMarketplace.itemsIds()
      const itemId = itemIds[0]
      const item = await SecuritizeMarketplace.listedItems(itemId)
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const nonce = await SecuritizeMarketplace.buyerNonces(user1Address)

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: securitizeMarketplaceAddress,
      }

      const types = {
        PurchaseItem: [
          { name: 'itemId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        itemId: itemId,
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await invalidSigner.signTypedData(domain, types, value)

      await expect(
        SecuritizeMarketplace.purchaseItemWithSig(itemId, user1Address, signature, deadline, {
          value: item.price,
        }),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidSignature')
    })
  })

  describe('Withdraw Funds', () => {
    beforeEach(async () => {
      // List and purchase an item first
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await SecuritizeMarketplace.connect(deployer).listItem(token, price, amount)

      const itemIds = await SecuritizeMarketplace.itemsIds()
      await SecuritizeMarketplace.connect(user1).purchaseItem(itemIds[0], { value: price })
    })

    it('Should withdraw funds correctly', async () => {
      const seller = await SecuritizeMarketplace.sellers(deployerAddress)
      const initialBalance = await ethers.provider.getBalance(deployerAddress)

      await expect(SecuritizeMarketplace.connect(deployer).withdrawFunds())
        .to.emit(SecuritizeMarketplace, 'FundsWithdrawn')
        .withArgs(deployerAddress, seller.pendingWithdrawals)

      const finalBalance = await ethers.provider.getBalance(deployerAddress)
      expect(finalBalance).to.be.gt(initialBalance)

      const updatedSeller = await SecuritizeMarketplace.sellers(deployerAddress)
      expect(updatedSeller.pendingWithdrawals).to.equal(0n)
    })

    it('Should revert if no earnings to withdraw', async () => {
      await expect(
        SecuritizeMarketplace.connect(user2).withdrawFunds(),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'NoEarningsToWithdraw')
    })
  })

  describe('Withdraw With Signature', () => {
    beforeEach(async () => {
      // List and purchase an item first
      const token = mockToken1Address
      const amount = 100n
      const price = ethers.parseEther('0.1')

      await MockToken1.connect(deployer).approve(securitizeMarketplaceAddress, ethers.MaxUint256)
      await SecuritizeMarketplace.connect(deployer).listItem(token, price, amount)

      const itemIds = await SecuritizeMarketplace.itemsIds()
      await SecuritizeMarketplace.connect(user1).purchaseItem(itemIds[0], { value: price })
    })

    it('Should withdraw with valid signature', async () => {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const nonce = (await SecuritizeMarketplace.sellers(deployerAddress)).signedNonce
      const seller = await SecuritizeMarketplace.sellers(deployerAddress)

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: securitizeMarketplaceAddress,
      }

      const types = {
        WithdrawFunds: [
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await deployer.signTypedData(domain, types, value)

      const initialBalance = await ethers.provider.getBalance(deployerAddress)

      await expect(
        SecuritizeMarketplace.connect(user2).withdrawWithSig(deployerAddress, signature, deadline),
      )
        .to.emit(SecuritizeMarketplace, 'FundsWithdrawn')
        .withArgs(deployerAddress, seller.pendingWithdrawals)

      const finalBalance = await ethers.provider.getBalance(deployerAddress)
      expect(finalBalance).to.be.gt(initialBalance)
    })

    it('Should revert with invalid signature', async () => {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const nonce = (await SecuritizeMarketplace.sellers(deployerAddress)).signedNonce

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: securitizeMarketplaceAddress,
      }

      const types = {
        WithdrawFunds: [
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await invalidSigner.signTypedData(domain, types, value)

      await expect(
        SecuritizeMarketplace.connect(user2).withdrawWithSig(deployerAddress, signature, deadline),
      ).to.be.revertedWithCustomError(SecuritizeMarketplace, 'InvalidSignature')
    })
  })
})
