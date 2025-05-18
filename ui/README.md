# Securitize-UI

1. Build a simple GUI to interact with the backend and marketplace:
   - Marketplace: Display all listed ERC-20 tokens, including name, price, and quantity.
   - Listing Form: Allow users to list tokens for sale. Include an option to sign the listing with their wallet.
   - Purchase Flow: Enable users to buy tokens by connecting their wallet.
   - Withdraw Section: Allow sellers to withdraw their funds in Ether.
2. Key Requirements:
   - Use a modern frontend framework (React, Vue, etc.).
   - Implement wallet integration using MetaMask, WalletConnect, or wagmi.
   - Display detailed information about signed messages and their validation.

---

### Commands

- Fill in the necessary env variables

```bash
cp .env.example .env
```

- Run app

```bash
pnpm dev
```

- Docker:

```bash
docker build -t securitize-ui -f Dockerfile .
```

Run: 

```bash
docker run -d -p 3001:3000 --env-file .env securitize-ui
```