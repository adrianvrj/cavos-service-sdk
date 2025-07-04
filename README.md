# Cavos Service SDK

A TypeScript SDK for interacting with the Cavos wallet provider service and Auth0 organization-based authentication.

## Installation

```bash
npm install cavos-service-sdk
```

## Wallet Provider Functions

### deployWallet
Deploy a new wallet on the specified network.

```typescript
import { deployWallet } from 'cavos-service-sdk';

const result = await deployWallet('mainnet', 'your-api-key');
```

### executeAction
Execute a transaction on the specified network.

```typescript
import { executeAction } from 'cavos-service-sdk';

const result = await executeAction(
  'mainnet',
  [{ to: '0x...', data: '0x...' }],
  'wallet-address',
  'hashed-private-key',
  'your-api-key'
);
```

### getTransactionTransfers
Get token transfers for a transaction hash.

```typescript
import { getTransactionTransfers } from 'cavos-service-sdk';

const transfers = await getTransactionTransfers('tx-hash', 'mainnet');
```

### getWalletCounts
Get the count of wallets for each supported network.

```typescript
import { getWalletCounts } from 'cavos-service-sdk';

const counts = await getWalletCounts();
```

## Auth0 Organization Authentication

All authentication methods are available as static methods on the default export `CavosAuth`:

```typescript
import CavosAuth from 'cavos-service-sdk';
```

### CavosAuth.signUp
Create a new user in an organization and deploy a wallet for them.

```typescript
const user = await CavosAuth.signUp(
  'user@example.com',
  'password123',
  'org_id_from_cavos_service',
  'mainnet' // network (optional, default: 'sepolia')
);

// Returns:
// {
//   user_id: "auth0|...",
//   email: "user@example.com",
//   wallet: { /* wallet deployment data */ },
//   organization: {
//     org_id: "org_id_from_cavos_service",
//     auth0_orgid: "org_..."
//   }
// }
```

### CavosAuth.signIn
Sign in a user to an organization and get their complete data including wallet information.

```typescript
const userData = await CavosAuth.signIn(
  'user@example.com',
  'password123',
  'org_id_from_cavos_service'
);

// Returns:
// {
//   user: {
//     sub: "auth0|...",
//     email: "user@example.com",
//     access_token: "...",
//     id_token: "...",
//     refresh_token: "..."
//   },
//   wallet: {
//     address: "0x...",
//     public_key: "...",
//     private_key: "...",
//     uid: "auth0|...",
//     // ... other wallet fields
//   },
//   external_wallet: {
//     // Organization's external wallet data (if exists)
//   },
//   organization: {
//     org_id: "org_id_from_cavos_service",
//     auth0_orgid: "org_...",
//     supabase_id: 123
//   }
// }
```

### CavosAuth.signOut
Sign out a user by revoking their Auth0 access token.

```typescript
const result = await CavosAuth.signOut('user_access_token');

// Returns:
// {
//   success: true,
//   message: 'User signed out successfully'
// }
```

## Usage Examples

### Complete Authentication Flow

```typescript
import CavosAuth from 'cavos-service-sdk';

// 1. Create a new user in an organization with wallet
const user = await CavosAuth.signUp(
  'user@company.com',
  'password123',
  'org_id_from_cavos_service',
  'mainnet'
);

console.log('User created:', user.user_id);
console.log('Wallet deployed:', user.wallet);
console.log('Organization:', user.organization);

// 2. Sign in user and get their data
const userData = await CavosAuth.signIn(
  'user@company.com',
  'password123',
  'org_id_from_cavos_service'
);

console.log('User signed in:', userData.user.email);
console.log('Wallet address:', userData.wallet.address);
console.log('Organization:', userData.organization.org_id);

// 3. Logout
const result = await CavosAuth.signOut(userData.user.access_token);
console.log(result.message);
```

## Error Handling

All functions throw descriptive errors when they fail. Handle them with try-catch:

```typescript
try {
  const result = await CavosAuth.signUp('user@example.com', 'password', 'org_id');
} catch (error) {
  console.error('Sign up failed:', error.message);
}
```

### Complete SignUp and SignIn Examples with Error Handling

```typescript
import CavosAuth from 'cavos-service-sdk';

async function registerNewUser() {
  try {
    const user = await CavosAuth.signUp(
      'john@company.com',
      'securePassword123',
      'company_org_id',
      'sepolia'
    );

    console.log('✅ User registered successfully!');
    console.log('User ID:', user.user_id);
    console.log('Email:', user.email);
    console.log('Wallet Address:', user.wallet.address);
    console.log('Organization:', user.organization.org_id);

    return user;
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Organization not found')) {
      console.error('The organization does not exist or is not configured');
    } else if (error.message.includes('deployWallet failed')) {
      console.error('Wallet deployment failed');
    } else if (error.message.includes('signUp failed')) {
      console.error('Auth0 user creation failed');
    }
    
    throw error;
  }
}

async function loginUser() {
  try {
    const userData = await CavosAuth.signIn(
      'john@company.com',
      'securePassword123',
      'company_org_id'
    );

    console.log('✅ User signed in successfully!');
    console.log('User ID:', userData.user.sub);
    console.log('Email:', userData.user.email);
    console.log('Wallet Address:', userData.wallet.address);
    console.log('Organization:', userData.organization.org_id);

    return userData;
  } catch (error) {
    console.error('❌ Sign in failed:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Organization not found')) {
      console.error('The organization does not exist or is not configured');
    } else if (error.message.includes('Invalid credentials')) {
      console.error('Email or password is incorrect');
    } else if (error.message.includes('Wallet not found')) {
      console.error('User wallet not found in database');
    } else if (error.message.includes('signIn failed')) {
      console.error('Auth0 authentication failed');
    }
    
    throw error;
  }
}
```

## License

MIT