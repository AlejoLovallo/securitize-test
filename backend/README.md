# Securitize backend

1. Build a backend service to:
   - Query listed items and purchase history from the smart contract.
   - Generate EIP-712-compliant messages for token transfers.
     Facilitate API routes for:
   - Listing items via signed messages ( POST /list).
   - Querying all items ( GET /items).
   - Purchasing item ( POST /purchase).
   - Withdraw item ( POST /withdraw)
2. Sell Tokens Directly (Optional Advanced Use Case):
   - Provide an API route ( POST /sell) to:
   - Accept signed EIP-712 messages authorizing the backend to facilitate direct token transfers between users.
   - Push the transfer transaction to the blockchain on behalf of the seller and buyer.
3. Key Requirements:
   - Use Node.js with Express, Nestjs or any other equivalent framework.
   - Integrate Web3.js or ethers.js for contract interaction.
   - Include utilities for signing messages on behalf of users (e.g., using a wallet or private key during testing).

---

### Commands

- Fill in the necessary env variables

```bash
cp .env.example .env
```

- Run redis container

```bash
docker run -d \
  --name redis-auth \
  -p 6379:6379 \
  redis:latest \
  redis-server --requirepass strongpassword
```

- Run backend

```bash
pnpm dev
```

- Or if you want to run the dockerized version:

```bash
docker build -t securitize-backend -f docker/Dockerfile .
```

And then run it with:

```bash
docker run -d --env-file <PATH TO.ENV> -p 3000:3005 securitize-backend
```

- Repository has also a [swagger](./swagger/openapi-spec.json) folder and a [postman](./postman/Securitize.postman_collection.json) collection ready to be used.

* Docker compose all in one, please refer to [Docker](./docker/README.md) documentation.
