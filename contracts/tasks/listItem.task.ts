import { task } from 'hardhat/config'
import chalk from 'chalk'
import { SecuritizeMarketplace } from '../typechain-types'

export const tasks = () => {
  task('list-item', 'List item')
    .addParam('token', 'token address')
    .addParam('amount', 'amount of tokens')
    .addParam('price', 'price of the tokens')
    .addOptionalParam('accountIndex', '')
    .setAction(async ({ token, amount, price, accountIndex }, { ethers }) => {
      const accounts = await ethers.getSigners()
      const account = await accounts[accountIndex || 0]

      console.log(account.address)
      console.log(`token:`, token)
      console.log(`amount:`, amount)
      console.log(`price:`, price)

      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')

      console.log(await SecuritizeMarketplace.getAddress())

      const response = await SecuritizeMarketplace.listItem(token, price, amount)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))

      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
