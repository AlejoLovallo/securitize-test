import chalk from 'chalk'
import { ethers, run, hardhatArguments } from 'hardhat'
import { printInfo, printError, VERIFY_NETWORKS_NOT_SUPPORTED, delay } from '../utils'
import { TaskArgs } from './verifyContract'

async function main() {
  if (!process.env.TOKEN_TRANSFER_ADDRESS) {
    throw Error('PLEASE PROVIDE A TOKEN TRANSFER ADDRESS TO ASSING IT AS MINTER')
  }

  console.log(chalk.yellow('Deploying MockERC20....'))
  const contractName = 'MockERC20'
  const constructorArguments = ['USD Coin', 'USDC', '6000000000000000', '6']
  const MockERC20 = await ethers.deployContract(contractName, constructorArguments)

  await MockERC20.waitForDeployment()

  console.log(chalk.green('MockERC20 deployed'))

  console.log(chalk.yellow('Assigning token transfer contract as token minter....'))

  await MockERC20.addMinter(process.env.TOKEN_TRANSFER_ADDRESS)

  const contractAddress = await MockERC20.getAddress()
  // const contractAddress = '0x250d3d82AE24cc04e340F9743EF5eEA37D6bEade'

  console.log(chalk.green(`SUCCESS! Deployed ${contractName} ${contractAddress}`))

  if (!VERIFY_NETWORKS_NOT_SUPPORTED.includes(hardhatArguments.network || '')) {
    const taskArgs: TaskArgs = {
      address: contractAddress,
      constructorArguments,
    }
    printInfo(`Starting Verification of ${contractName} ${contractAddress}`)
    await delay(3000)
    try {
      await run('verify:verify', taskArgs)
    } catch (err: unknown) {
      if (err.message.includes('Already Verified')) {
        printError('Already Verified')
        return
      }
      printError('Verification Failed')
      throw err
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
