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

###

### Deployment

- [Sepolia](https://sepolia.etherscan.io/address/0x7C7bfb2DdD9eB84865d198E0c29d37350fdFFBfb#code)
