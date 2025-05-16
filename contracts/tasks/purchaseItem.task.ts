import { task } from 'hardhat/config'
import chalk from 'chalk'
import { SecuritizeMarketplace } from '../typechain-types'

export const tasks = () => {
  task('buy-item', 'Purchase item')
    .addParam('item', 'item id')
    .addOptionalParam('accountIndex', '')
    .setAction(async ({ item, accountIndex }, { ethers }) => {
      const accounts = await ethers.getSigners()
      const account = await accounts[accountIndex || 0]

      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')

      const response = await SecuritizeMarketplace.connect(account).purchaseItem(item)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))

      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
