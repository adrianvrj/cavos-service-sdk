/**
 * Cavos Service SDK
 *
 * Provides functions to interact with the external endpoints of the cavos-wallet-provider service.
 *
 * @module cavos-service-sdk
 */

import axios from 'axios';

const BASE_URL = 'https://services.cavos.xyz/api/v1/external';

/**
 * Deploy a new wallet using the cavos-wallet-provider external API.
 * @param network - The network to deploy the wallet on (string).
 * @param apiKey - Bearer token for authentication (string).
 * @returns The deployment result from the API.
 */
export async function deployWallet(
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
 * @param network - The network to execute on (string).
 * @param calls - The calls to execute (any[]).
 * @param address - The wallet address (string).
 * @param hashedPk - The hashed private key (string).
 * @param apiKey - Bearer token for authentication (string).
 * @returns The execution result from the API.
 */
export async function executeAction(
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
 * @param txHash - The transaction hash to query (string).
 * @param network - The network to query (string, default: 'mainnet').
 * @returns The transfers data from the API.
 */
export async function getTransactionTransfers(
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
 * @returns The wallet counts from the API.
 */
export async function getWalletCounts(): Promise<any> {
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