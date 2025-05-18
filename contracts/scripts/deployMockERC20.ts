import chalk from 'chalk'
import { ethers, run, hardhatArguments } from 'hardhat'
import { printInfo, printError, VERIFY_NETWORKS_NOT_SUPPORTED, delay } from '../utils'
import { TaskArgs } from './verifyContract'

async function main() {
  if (!process.env.TOKEN_TRANSFER_ADDRESS) {
    throw Error('PLEASE PROVIDE A TOKEN TRANSFER ADDRESS TO ASSING IT AS MINTER')
  }

  // Token parameters with defaults
  const tokenName = process.env.TOKEN_NAME || 'USD Coin'
  const tokenSymbol = process.env.TOKEN_SYMBOL || 'USDC'
  const tokenSupply = process.env.TOKEN_SUPPLY || '6000000000000000'
  const tokenDecimals = process.env.TOKEN_DECIMALS || '6'

  console.log(chalk.yellow(`Deploying MockERC20 with parameters:`))
  console.log(chalk.yellow(`Name: ${tokenName}`))
  console.log(chalk.yellow(`Symbol: ${tokenSymbol}`))
  console.log(chalk.yellow(`Supply: ${tokenSupply}`))
  console.log(chalk.yellow(`Decimals: ${tokenDecimals}`))

  const contractName = 'MockERC20'
  const constructorArguments = [tokenName, tokenSymbol, tokenSupply, tokenDecimals]
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
