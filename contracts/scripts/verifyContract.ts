import { ethers, run } from 'hardhat'
import { printInfo, printError, delay, VERIFY_NETWORKS_NOT_SUPPORTED } from '../utils'
import { Contract } from 'ethers'
import { Network } from 'hardhat/types'
import chalk from 'chalk'

export type TaskArgs = {
  address: string
  constructorArguments?: string[]
}

export const verifyContract = async (
  network: Network,
  contractName: string,
  constructorArguments?: string[],
  upgradeable = true,
) => {
  let ImplementationContract: Contract

  if (network.live) {
    try {
      if (!upgradeable) {
        ImplementationContract = await ethers.getContract(`${contractName}`)
      } else {
        ImplementationContract = await ethers.getContract(`${contractName}_Implementation`)
      }
    } catch (err: unknown) {
      console.log(chalk.red('Contract not found'))
      throw err
    }

    const implementationAddress = await ImplementationContract.getAddress()

    printInfo(`Implementation of ${contractName} address ${implementationAddress}`)

    if (VERIFY_NETWORKS_NOT_SUPPORTED.includes(network.name)) {
      return
    }

    const taskArgs: TaskArgs = {
      address: implementationAddress,
    }
    if (constructorArguments) {
      taskArgs.constructorArguments = constructorArguments
    }

    try {
      printInfo(`Starting Verification of ${implementationAddress}`)
      await delay(5000)
      await run('verify:verify', taskArgs)
    } catch (err: unknown) {
      if (err.message.includes('Already Verified')) {
        printError('Already Verified')
        return
      }
      throw err
    }
  }
}
