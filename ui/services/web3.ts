import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import erc20ABI from './abis/erc20.json'
import marketplaceABI from './abis/marketplace.json'

const BLOCKCHAIN_RPC = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS

const client = createPublicClient({
  chain: mainnet,
  transport: http(BLOCKCHAIN_RPC),
})

interface TokenData {
  name: string
  symbol: string
  decimals: number
}

export const getTokenData = async (tokenAddress: string): Promise<TokenData> => {
  const formattedTokenAddress = tokenAddress.startsWith('0x')
    ? (tokenAddress as `${string}`)
    : (`0x${tokenAddress}` as `0x${string}`)

  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({
        address: formattedTokenAddress,
        abi: erc20ABI,
        functionName: 'name',
      }),
      client.readContract({
        address: formattedTokenAddress,
        abi: erc20ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: formattedTokenAddress,
        abi: erc20ABI,
        functionName: 'decimals',
      }),
    ])

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
    }
  } catch (error) {
    console.error('Error fetching token data:', error)
    throw error
  }
}

export const purchaseToken = async (itemId: number, price: string, walletClient: any) => {
  try {
    const marketplaceAddress = MARKETPLACE_ADDRESS?.startsWith('0x')
      ? (MARKETPLACE_ADDRESS as `0x${string}`)
      : (`0x${MARKETPLACE_ADDRESS}` as `0x${string}`)

    // First check if the item exists and is active
    const item = await client.readContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'listedItems',
      args: [BigInt(itemId)],
    })

    if (!item) {
      throw new Error('Item not found')
    }

    const { request } = await client.simulateContract({
      account: walletClient.account,
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'purchaseItem',
      args: [BigInt(itemId)],
      value: BigInt(price),
    })

    const hash = await walletClient.writeContract(request)
    const receipt = await client.waitForTransactionReceipt({ hash })

    return receipt
  } catch (error: any) {
    // Check for specific contract errors
    if (error.message.includes('InvalidItemId')) {
      throw new Error('Invalid item ID')
    } else if (error.message.includes('InactiveItem')) {
      throw new Error('Item is not active')
    } else if (error.message.includes('InvalidPayment')) {
      throw new Error('Invalid payment amount')
    }

    console.error('Error purchasing token:', {
      error,
      message: error.message,
      cause: error.cause,
    })
    throw error
  }
}

export const withdrawFunds = async (walletClient: any) => {
  try {
    const marketplaceAddress = MARKETPLACE_ADDRESS?.startsWith('0x')
      ? (MARKETPLACE_ADDRESS as `0x${string}`)
      : (`0x${MARKETPLACE_ADDRESS}` as `0x${string}`)

    console.log('Withdrawing funds with wallet:', walletClient.account)

    const { request } = await client.simulateContract({
      account: walletClient.account,
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'withdrawFunds',
      args: [],
    })

    const hash = await walletClient.writeContract(request)
    const receipt = await client.waitForTransactionReceipt({ hash })

    console.log('Withdraw successful, receipt:', receipt)
    return receipt
  } catch (error: any) {
    console.error('Error withdrawing funds:', error)

    // Add more detailed error logging
    if (error.message) {
      console.error('Error message:', error.message)
    }

    if (error.cause) {
      console.error('Error cause:', error.cause)
    }

    throw error
  }
}

export const signTypedMessage = async (walletClient: any, typedData: any, primaryType: string) => {
  try {
    console.log('Requesting signature for:', {
      domain: typedData.domain,
      types: typedData.types,
      primaryType,
      message: typedData.value,
    })

    const signature = await walletClient.signTypedData({
      account: walletClient.account,
      domain: typedData.domain,
      types: typedData.types,
      primaryType,
      message: typedData.value,
    })

    console.log('Signature received:', signature)
    return signature
  } catch (error) {
    console.error('Error signing message:', error)
    throw error
  }
}

export const listItem = async (
  tokenAddress: string,
  price: string,
  amount: number,
  walletClient: any,
) => {
  try {
    const marketplaceAddress = MARKETPLACE_ADDRESS?.startsWith('0x')
      ? (MARKETPLACE_ADDRESS as `0x${string}`)
      : (`0x${MARKETPLACE_ADDRESS}` as `0x${string}`)

    console.log('Listing item with params:', {
      tokenAddress,
      price,
      amount,
      marketplaceAddress,
    })

    const { request } = await client.simulateContract({
      account: walletClient.account,
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'listItem',
      args: [tokenAddress as `0x${string}`, BigInt(price), BigInt(amount)],
    })

    const hash = await walletClient.writeContract(request)
    const receipt = await client.waitForTransactionReceipt({ hash })

    console.log('Item listed successfully:', receipt)
    return receipt
  } catch (error: any) {
    console.error('Error listing item:', {
      error,
      message: error.message,
      cause: error.cause,
    })
    throw error
  }
}
