import { HardhatUserConfig } from 'hardhat/config'
import { config as dotEnvConfig } from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-abi-exporter'

dotEnvConfig()

import networks from './hardhat.networks'
import namedAccounts from './hardhat.accounts'

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
