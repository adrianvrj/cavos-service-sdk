# Cavos Service SDK

A Node.js/TypeScript SDK for interacting with the external endpoints of the cavos-wallet-provider service.

## Features
- Deploy wallets
- Execute actions
- Query transaction transfers
- Get wallet counts

## Usage

```js
import { deployWallet, executeAction, getTransactionTransfers, getWalletCounts } from 'cavos-service-sdk';

// Deploy a wallet
const wallet = await deployWallet('sepolia', 'your-api-key');

// Execute an action
const result = await executeAction('sepolia', [/* calls */], 'wallet-address', 'hashedPk', 'your-api-key');

// Get transaction transfers
const transfers = await getTransactionTransfers('0x123...', 'sepolia');

// Get wallet counts
const counts = await getWalletCounts();
```