# Cavos Service SDK

A TypeScript/JavaScript SDK for interacting with the external endpoints of the Cavos Wallet Provider service, including user registration, authentication (Auth0), wallet management, and transaction execution.

## Features
- Register users in organizations with blockchain accounts on Starknet
- Login users with organization-specific connection
- Deploy and manage wallets
- Execute transactions
- Query wallet and transaction data

## Installation

```bash
npm install cavos-service-sdk
```

## Usage

```typescript
import { CavosAuth } from 'cavos-service-sdk';

// Register a new user in an organization
async function registerUser() {
  const orgSecret = 'ORG_SECRET_TOKEN'; // The secret token for the organization
  const email = 'user@example.com';
  const password = 'Password123';
  const network = 'sepolia';
  // Optionally, you can pass user_metadata if needed
  const result = await CavosAuth.signUp(email, password, orgSecret, network);
  console.log(result);
}

// Login a user in an organization
async function loginUser() {
  const orgSecret = 'ORG_SECRET_TOKEN';
  const email = 'user@example.com';
  const password = 'Password123';
  const result = await CavosAuth.signIn(email, password, orgSecret);
  // result.data.access_token is the Auth0 access token
  // result.data.wallet contains the user's wallet info
  console.log(result);
}

```

## API Reference

### `CavosAuth.signUp(email, password, orgSecret, network = 'sepolia')`
Registers a new user in the specified organization (using Auth0 Database Connection) and creates a wallet for them.
- `email`: User's email
- `password`: User's password
- `orgSecret`: The organization's secret token (used as Bearer token)
- `network`: Network to deploy the wallet on (default: 'sepolia')
- Returns: User data, wallet info, and Auth0 user_id

### `CavosAuth.signIn(email, password, orgSecret)`
Logs in a user using Auth0 (Resource Owner Password Grant) for the organization's connection.
- `email`: User's email
- `password`: User's password
- `orgSecret`: The organization's secret token
- Returns: User data, wallet info, and Auth0 access_token

### Other Methods
- `deployWallet(network, apiKey)` - Deploy a new wallet
- `executeAction(network, calls, address, hashedPk, apiKey)` - Execute a transaction
- `getTransactionTransfers(txHash, network)` - Get token transfers for a transaction
- `getWalletCounts()` - Get the count of wallets per network

## Auth0 Integration Notes
- Each organization has its own Auth0 Database Connection (created on org registration).
- Registration and login use the organization's connection for user isolation.
- The SDK does not store user credentials; all authentication is handled by Auth0.

## Example: Full Auth Flow
## License
MIT