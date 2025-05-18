# Securitize Marketplace contracts

### Assignment

Implement a Marketplace contract using ERC-20 tokens as the traded items.

- List Item: A user can list a certain number of ERC-20 tokens for sale at a specified price in Ether.
- Purchase Item: Another user can purchase the listed tokens by sending the required amount of Ether. The tokens are transferred to the buyer.
- Withdraw Funds: Sellers can withdraw their earnings in Ether from the marketplace contract.2.

**EIP-712 Signed Message Interaction**:

- Add a function that enables token transfers based on an EIP-712 signed message:
  - Users can sign a message authorizing the marketplace to transfer tokens on their behalf.
  - The contract verifies the signature before executing the transfer.
- Include a specific use case in the marketplace:
  - Allow sellers to pre-authorize token listings using signed messages.

**3. Key Requirements**

- Use Solidity and follow EVM-compatible standards.
- Include events for important actions ( ItemListed , ItemPurchased , FundsWithdrawn ).
- Use OpenZeppelin libraries such as ERC-20 where possible.

---

### Commands

- Compile

```bash
npx hardhat compile
```

- Deploy

```bash
npx hardhat deploy
```

- Deploy to live network

```bash
npx hardhat deploy --network <NETWORK>
```

- Test

```bash
npx hardhat test
```

```bash
TOKEN_TRANSFER_ADDRESS=0x7237f178E07D159c636fE6e72a8F6899e3671Fbd npx hardhat run scripts/deployMockERC20.ts --network sepolia
```

Also you can pass optionally arguments for the token deployment

```typescript
// Token parameters with defaults
const tokenName = process.env.TOKEN_NAME || 'USD Coin'
const tokenSymbol = process.env.TOKEN_SYMBOL || 'USDC'
const tokenSupply = process.env.TOKEN_SUPPLY || '6000000000000000'
const tokenDecimals = process.env.TOKEN_DECIMALS || '6'
```

### Tasks

Clarification: All tasks has to be run by adding --network <NETWORK> to run it.

0. Approve a token to the contract

```bash
npx hardhat approve-tokens --token <TOKEN ADDRESS> --amount <AMOUNT TO APPROVE>
```

1. List item

```bash
npx hardhat list-item --token <TOKEN ADDRESS> --amount <AMOUNT> --price <TOKENS PRICE>
```

2. Purchase item

```bash
npx hardhat buy-item --item <ITEM_ID>
```

3. Withdraw funds

```bash
npx hardhat withdraw-funds
```

### Deployment

- [Sepolia](https://sepolia.etherscan.io/address/E463ec80522a0208489783bD8Ff82C972A33D5aa)
