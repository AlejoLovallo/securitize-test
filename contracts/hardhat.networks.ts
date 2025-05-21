const networks: any = {
  hardhat: {
    live: false,
    allowUnlimitedContractSize: true,
    initialBaseFeePerGas: 0,
    chainId: 31337,
    tags: ['test', 'local'],
  },
  localhost: {
    chainId: 31337,
    url: 'http://127.0.0.1:8545',
    allowUnlimitedContractSize: true,
    timeout: 1000 * 60,
  },
  sepolia: {
    live: true,
    chainId: 11155111,
    url: process.env.SEPOLIA_ALCHEMY_KEY
      ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`
      : '',
    accounts: process.env.PRIVATE_KEY
      ? [process.env.PRIVATE_KEY]
      : process.env.MNEMONIC
        ? { mnemonic: process.env.MNEMONIC }
        : [],
    allowUnlimitedContractSize: false,
    timeout: 1000 * 60,
    tags: ['testnet', 'sepolia'],
  },
}

export default networks
