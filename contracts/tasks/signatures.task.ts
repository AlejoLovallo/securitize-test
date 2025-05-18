import { task } from 'hardhat/config'
import { SecuritizeMarketplace } from '../typechain-types'
import chalk from 'chalk'

export const tasks = () => {
  task('list-item-sig', 'Generate list item signature')
    .addParam('token', 'token address')
    .addParam('amount', 'amount of tokens')
    .addParam('price', 'price of the tokens')
    .addOptionalParam('accountIndex', '')
    .setAction(async ({ token, amount, price, accountIndex }, { ethers }) => {
      const accounts = await ethers.getSigners()
      const account = await accounts[accountIndex || 0]

      const chainId = (await ethers.provider.getNetwork()).chainId
      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')

      const nonce = (await SecuritizeMarketplace.sellers(account.address)).signedNonce
      const deadline = (await ethers.provider.getBlock('latest'))!.timestamp + 3600

      console.log(account.address)
      console.log(`token:`, token)
      console.log(`amount:`, amount)
      console.log(`price:`, price)
      console.log(`nonce:`, nonce)
      console.log(`deadline:`, deadline)

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId,
        verifyingContract: await SecuritizeMarketplace.getAddress(),
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

      const signature = await account.signTypedData(domain, types, value)

      console.log('Signature:', signature)
    })

  task('buy-item-sig', 'Purchase item with signature')
    .addParam('item', 'item id')
    .addOptionalParam('accountIndex', '')
    .setAction(async ({ item, accountIndex }, { ethers }) => {
      const accounts = await ethers.getSigners()
      const account = await accounts[accountIndex || 0]

      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')

      const nonce = (await SecuritizeMarketplace.sellers(account.address)).signedNonce
      const deadline = (await ethers.provider.getBlock('latest'))!.timestamp + 3600

      const listItem = await SecuritizeMarketplace.listedItems(item)

      if (!listItem) {
        console.log(chalk.red('Item not found'))
        return
      }

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await SecuritizeMarketplace.getAddress(),
      }

      const types = {
        PurchaseItem: [
          { name: 'itemId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const value = {
        itemId: item,
        nonce: nonce,
        deadline: deadline,
      }

      const signature = await account.signTypedData(domain, types, value)

      console.log('Item ID:', item)
      console.log('Nonce:', nonce)
      console.log('Deadline:', deadline)
      console.log('Signature:', signature)
    })

  task('withdraw-funds', 'Withdraw funds')
    .addOptionalParam('accountIndex', '')
    .setAction(async ({ accountIndex }, { ethers }) => {
      const accounts = await ethers.getSigners()
      const account = await accounts[accountIndex || 0]

      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')

      const nonce = (await SecuritizeMarketplace.sellers(account.address)).signedNonce
      const deadline = (await ethers.provider.getBlock('latest'))!.timestamp + 3600

      const domain = {
        name: 'SecuritizeMarketplace',
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await SecuritizeMarketplace.getAddress(),
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

      const signature = await account.signTypedData(domain, types, value)

      console.log('Nonce:', nonce)
      console.log('Deadline:', deadline)
      console.log('Signature:', signature)
    })
}
