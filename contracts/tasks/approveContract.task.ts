import { task } from 'hardhat/config'
import chalk from 'chalk'
import { SecuritizeMarketplace } from '../typechain-types'
import { Contract, MaxUint256 } from 'ethers'

export const tasks = () => {
  task('approve-tokens', 'Approve ERC20 tokens to Token Transfer')
    .addParam('token', 'token address')
    .addOptionalParam('amount', 'amount to bridge')
    .addOptionalParam('accountIndex', '')
    .setAction(async ({ token, amount, accountIndex }, { ethers }) => {
      const accounts = await ethers.getSigners()
      const account = await accounts[accountIndex || 0]

      const ERC20Abi = ['function approve(address spender, uint256 value) returns(bool)']
      const Token = new Contract(token, ERC20Abi, account)

      const SecuritizeMarketplace: SecuritizeMarketplace =
        await ethers.getContract('SecuritizeMarketplace')
      const contractAddress = await SecuritizeMarketplace.getAddress()

      const response = await Token.connect(account).approve(contractAddress, amount || MaxUint256)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))

      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
