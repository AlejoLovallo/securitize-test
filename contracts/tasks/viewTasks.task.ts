import { task } from 'hardhat/config'
import { SecuritizeMarketplace } from '../typechain-types'
import chalk from 'chalk'

export const tasks = () => {
  task('list-item-ids', 'Get active items').setAction(async ({}, { ethers }) => {
    const SecuritizeMarketplace: SecuritizeMarketplace =
      await ethers.getContract('SecuritizeMarketplace')
    const response = await SecuritizeMarketplace.itemsIds()

    console.log(chalk.green('---- ITEM IDS ----'))
    console.log(response.toString())
  })

  task('get-seller', 'Get seller')
    .addParam('seller', 'Seller address')
    .setAction(async ({ seller }, { ethers }) => {
      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')
      const response = await SecuritizeMarketplace.sellers(seller)

      if (response[6] === false) {
        console.log(chalk.red('Seller not found'))
        return
      }

      console.log(chalk.green('---- SELLER ----'))
      console.log(response.toString())
    })

  task('get-item', 'Get item')
    .addParam('item', 'Item id')
    .setAction(async ({ item }, { ethers }) => {
      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')
      const response = await SecuritizeMarketplace.listedItems(item)

      if (response[4] === false) {
        console.log(chalk.red('Item not found'))
        return
      }

      console.log(chalk.green('---- ITEM ----'))
      console.log(response.toString())
    })
}
