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

### Deployment

- Dapp has been deployed at:
