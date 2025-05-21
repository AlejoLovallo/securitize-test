# Securitize test

- Securitize interview assesment

---

### Requirements

General:

- Node v23
- Pnpm v9.4.0

- Backend:

  - Nest Js
  - Docker
  - Redis

- Contracts:

  - Hardhat

- UI:
  - Next Js

### Code structure

- Monorepo built with pnpm and turbo.
- **Workspaces**:
  - UI: UI Dapp
  - Backend: Backend for retrieving contract and tokens data, and also for executing methods through signatures
  - Contracts: Securitize Marketplace smart contract.

### Commands

- Set up node version

```bash
nvm use
```

- Install pnpm version

```bash
npm i -g pnpm@9.4.0
```

- Install

```bash
pnpm install
```

---

### Contracts

- Fill in the necessary env variables

```bash
cd contracts && cp .env.example .env
```

- Compiling contracts

```bash
pnpm contracts:compile
```

- Local deployment

```bash
pnpm contracts:deploy
```

- Tests

```bash
pnpm contracts:test
```

- Deploy to live network

```bash
pnpm contracts:deploy:network <NETWORK>
```

- Please refer to further documentation at [contracts](./contracts/README.md)

### Backend

- Please refer to further documentation at [backend](./backend/README.md)

### UI

- Please refer to further documentation at [frontend](./ui/README.md)

---

### Development commands

1. Everything from root repository

```bash
nvm use && pnpm i
```

**Smart contracts**

```bash
cd contracts && cp .env.example .env
```

- Clarifications:
  - You will need to provide a sepolia api key in order to verify contracts and deploy contracts.
  * Mnemonic or private key is accepted.

* Local compile

```bash
pnpm contracts:compile
```

- Local tests

```bash
pnpm contracts:test
```

- Local deployment (using on the fly hardhat node provided by hardhat deployment plugin)

```bash
pnpm contracts:deploy
```

- Network deployment

```bash
pnpm contracts:deploy:network sepolia
```

- To deploy with a running node like hardhat please do:

```bash
pnpm contracts:node
```

**Backend**

```bash
cd backend && cp .env.example .env
```

Clarification:

- You need to provide your deployed contract address
- You need to provide an Alchemy api key from (https://docs.etherscan.io/getting-started/viewing-api-usage-statistics)

Then start a redis instance with docker:

```bash
docker run -d \
  --name redis-auth \
  -p 6379:6379 \
  redis:latest \
  redis-server
```

- And lastly, run:

```bash
pnpm backend:dev
```

### UI

The ui is designed to run only in **sepolia**.

```bash
cp .env.example .env
```

Then just simply run

```bash
pnpm ui:dev
```

### Deployment

- Dapp has been deployed at: https://securitize-test-ui.vercel.app/

---

### Completition status

- Smart Contracts: [100%]
- Backend: [100%]
- Frontend: [75%]
  - Send signed typed message to backend and execute transaction
  - Token filtering
  - Minor adjustments needed.
