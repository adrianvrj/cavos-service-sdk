/**
 * Cavos Service SDK
 *
 * Provides functions to interact with the external endpoints of the cavos-wallet-provider service,
 * including Auth0-based authentication, wallet management, and transaction execution.
 *
 * @module cavos-service-sdk
 */

const BASE_URL = 'https://services.cavos.xyz/api/v1/external';

/**
 * CavosAuth provides static methods for user registration, authentication, wallet management,
 * and transaction execution using the Cavos Wallet Provider and Auth0.
 */
export class CavosAuth {
  /**
   * Register a new user in an organization (Auth0 Database Connection) and create a wallet for them.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @param {string} orgSecret - The organization's secret token (used as Bearer token).
   * @param {string} [network='sepolia'] - The network to deploy the wallet on (default: 'sepolia').
   * @returns {Promise<object>} The user data, wallet info, and Auth0 user_id.
   * @throws {Error} If registration or wallet deployment fails.
   */
  static async signUp(
    email: string,
    password: string,
    orgSecret: string,
    network: string = 'sepolia',
  ): Promise<any> {
    try {
      const res = await fetch(
        `${BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${orgSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, network }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`signUp failed: ${res.status} ${JSON.stringify(errorData)}`);
      }
      return await res.json();
    } catch (error: any) {
      throw new Error(`signUp failed: ${error.message}`);
    }
  }

  /**
   * Log in a user using Auth0 (Resource Owner Password Grant) for the organization's connection.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @param {string} orgSecret - The organization's secret token (used as Bearer token).
   * @returns {Promise<object>} The user data, wallet info, and Auth0 access_token.
   * @throws {Error} If authentication fails.
   */
  static async signIn(
    email: string,
    password: string,
    orgSecret: string
  ): Promise<any> {
    try {
      const res = await fetch(
        `${BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${orgSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`signIn failed: ${res.status} ${JSON.stringify(errorData)}`);
      }
      return await res.json();
    } catch (error: any) {
      throw new Error(`signIn failed: ${error.message}`);
    }
  }

  /**
   * Deploy a new wallet using the cavos-wallet-provider external API.
   *
   * @param {string} network - The network to deploy the wallet on.
   * @param {string} apiKey - The API key or Bearer token for authentication.
   * @returns {Promise<object>} The wallet deployment data.
   * @throws {Error} If wallet deployment fails.
   */
  static async deployWallet(
    network: string,
    apiKey: string
  ): Promise<any> {
    try {
      const res = await fetch(
        `${BASE_URL}/deploy`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ network }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`deployWallet failed: ${res.status} ${JSON.stringify(errorData)}`);
      }
      return await res.json();
    } catch (error: any) {
      throw new Error(`deployWallet failed: ${error.message}`);
    }
  }

  /**
   * Execute an action (transaction) using the cavos-wallet-provider external API.
   *
   * @param {string} network - The network to execute the transaction on.
   * @param {any[]} calls - The transaction calls to execute.
   * @param {string} address - The wallet address.
   * @param {string} hashedPk - The hashed private key.
   * @param {string} apiKey - The API key or Bearer token for authentication.
   * @returns {Promise<object>} The transaction result.
   * @throws {Error} If the transaction fails.
   */
  static async executeAction(
    network: string,
    calls: any[],
    address: string,
    hashedPk: string,
    apiKey: string
  ): Promise<any> {
    try {
      const res = await fetch(
        `${BASE_URL}/execute`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ network, calls, address, hashedPk }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`executeAction failed: ${res.status} ${JSON.stringify(errorData)}`);
      }
      return await res.json();
    } catch (error: any) {
      throw new Error(`executeAction failed: ${error.message}`);
    }
  }

  /**
   * Get token transfers for a given transaction hash.
   *
   * @param {string} txHash - The transaction hash.
   * @param {string} [network='mainnet'] - The network to query (default: 'mainnet').
   * @returns {Promise<object>} The token transfer data.
   * @throws {Error} If the query fails.
   */
  static async getTransactionTransfers(
    txHash: string,
    network: string = 'mainnet'
  ): Promise<any> {
    try {
      const url = new URL(`${BASE_URL}/tx`);
      url.searchParams.append('txHash', txHash);
      url.searchParams.append('network', network);
      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`getTransactionTransfers failed: ${res.status} ${JSON.stringify(errorData)}`);
      }
      return await res.json();
    } catch (error: any) {
      throw new Error(`getTransactionTransfers failed: ${error.message}`);
    }
  }

  /**
   * Get the count of wallets for each supported network.
   *
   * @returns {Promise<object>} The wallet counts per network.
   * @throws {Error} If the query fails.
   */
  static async getWalletCounts(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/wallets/count`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`getWalletCounts failed: ${res.status} ${JSON.stringify(errorData)}`);
      }
      return await res.json();
    } catch (error: any) {
      throw new Error(`getWalletCounts failed: ${error.message}`);
    }
  }
}