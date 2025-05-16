import { task } from 'hardhat/config'
import { SecuritizeMarketplace } from '../typechain-types'
import chalk from 'chalk'

export const tasks = () => {
  task('list-item-ids', 'Get active items').setAction(async ({}, { ethers }) => {
    const [admin] = await ethers.getSigners()
    const SecuritizeMarketplace: SecuritizeMarketplace =
      await ethers.getContract('SecuritizeMarketplace')
    const response = await SecuritizeMarketplace.connect(admin).itemsIds()

    console.log(chalk.green('---- ITEM IDS ----'))
    console.log(response.toString())
  })
}
