import { HardhatUserConfig } from 'hardhat/config'
import { config as dotEnvConfig } from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-abi-exporter'

import { tasks as ListItemTask } from './tasks/listItem.task'
import { tasks as WithdrawFundsTask } from './tasks/withdrawFunds.task'
import { tasks as PurchaseItemTask } from './tasks/purchaseItem.task'
import { tasks as ApproveTask } from './tasks/approveContract.task'
import { tasks as ViewTasks } from './tasks/viewTasks.task'
import { tasks as SignaturesTasks } from './tasks/signatures.task'

dotEnvConfig()

import networks from './hardhat.networks'
import namedAccounts from './hardhat.accounts'

ListItemTask()
WithdrawFundsTask()
PurchaseItemTask()
ApproveTask()
ViewTasks()
SignaturesTasks()

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks,
  namedAccounts,
  abiExporter: {
    path: './abis',
    runOnCompile: true,
    only: [':SecuritizeMarketplace$'],
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.SEPOLIASCAN_API_KEY ?? '',
    },
  },
}

export default config
