import { config } from 'dotenv'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { printDeploySuccessful, printInfo } from '../utils'
import { verifyContract } from '../scripts/verifyContract'

config()

const version = 'V1'
const ContractName = 'SecuritizeMarketplace'
const ContractVersion = 'v1.0.0'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)
  const feeData = await hre.ethers.provider.getFeeData()

  const SecuritizeMarketplaceResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    waitConfirmations: network.live ? 5 : 0,
    skipIfAlreadyDeployed: false,
    // EIP-1559
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
  })

  const securitizeMarketplaceAddress = SecuritizeMarketplaceResult.address

  printDeploySuccessful(ContractName, securitizeMarketplaceAddress)

  await verifyContract(network, ContractName, [], false)

  return true
}

export default func
const id = ContractName + ContractVersion
func.tags = [id, ContractName, version]
func.dependencies = ['BridgeRegistry']
func.id = id
