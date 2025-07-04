/**
 * Cavos Service SDK
 *
 * Provides functions to interact with the external endpoints of the cavos-wallet-provider service,
 * including Auth0-based authentication, wallet management, and transaction execution.
 *
 * @module cavos-service-sdk
 */

import axios from 'axios';

const BASE_URL = 'https://services.cavos.xyz/api/v1/external';

/**
 * CavosAuth provides static methods for user registration, authentication, wallet management,
 * and transaction execution using the Cavos Wallet Provider and Auth0.
 */
class CavosAuth {
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
      const { data } = await axios.post(
        `${BASE_URL}/auth/register`,
        { email, password, network },
        {
          headers: {
            Authorization: `Bearer ${orgSecret}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `signUp failed: ${error.response.status} ${JSON.stringify(error.response.data)}`
        );
      } else {
        throw new Error(`signUp failed: ${error.message}`);
      }
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
      const { data } = await axios.post(
        `${BASE_URL}/auth/login`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${orgSecret}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `signIn failed: ${error.response.status} ${JSON.stringify(error.response.data)}`
        );
      } else {
        throw new Error(`signIn failed: ${error.message}`);
      }
    }
  }

  /**
   * Log out a user by returning the Auth0 logout URL for the client to redirect to.
   *
   * @param {string} accessToken - The Auth0 access token to be invalidated (client should remove it).
   * @returns {Promise<object>} An object containing the logout URL (`logout_url`).
   * @throws {Error} If the logout operation fails.
   */
  static async signOut(accessToken: string): Promise<any> {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/logout`,
        { access_token: accessToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `signOut failed: ${error.response.status} ${JSON.stringify(error.response.data)}`
        );
      } else {
        throw new Error(`signOut failed: ${error.message}`);
      }
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
    const config = {
      headers: { Authorization: `Bearer ${apiKey}` },
    };
    const params = { network };
    try {
      const { data } = await axios.post(`${BASE_URL}/deploy`, params, config);
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `deployWallet failed: ${error.response.status} ${JSON.stringify(error.response.data)}\nHeaders: ${JSON.stringify(error.response.headers)}`
        );
      } else if (error.request) {
        throw new Error(`deployWallet failed: No response received. Request: ${error.request}`);
      } else {
        throw new Error(`deployWallet failed: ${error.message}`);
      }
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
    const config = {
      headers: { Authorization: `Bearer ${apiKey}` },
    };
    const params = { network, calls, address, hashedPk };
    try {
      const { data } = await axios.post(`${BASE_URL}/execute`, params, config);
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `executeAction failed: ${error.response.status} ${JSON.stringify(error.response.data)}\nHeaders: ${JSON.stringify(error.response.headers)}`
        );
      } else if (error.request) {
        throw new Error(`executeAction failed: No response received. Request: ${error.request}`);
      } else {
        throw new Error(`executeAction failed: ${error.message}`);
      }
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
      const { data } = await axios.get(`${BASE_URL}/tx`, {
        params: { txHash, network },
      });
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `getTransactionTransfers failed: ${error.response.status} ${JSON.stringify(error.response.data)}\nHeaders: ${JSON.stringify(error.response.headers)}`
        );
      } else if (error.request) {
        throw new Error(`getTransactionTransfers failed: No response received. Request: ${error.request}`);
      } else {
        throw new Error(`getTransactionTransfers failed: ${error.message}`);
      }
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
      const { data } = await axios.get(`${BASE_URL}/wallets/count`);
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `getWalletCounts failed: ${error.response.status} ${JSON.stringify(error.response.data)}\nHeaders: ${JSON.stringify(error.response.headers)}`
        );
      } else if (error.request) {
        throw new Error(`getWalletCounts failed: No response received. Request: ${error.request}`);
      } else {
        throw new Error(`getWalletCounts failed: ${error.message}`);
      }
    }
  }
}

export { CavosAuth };