/**
 * Cavos Service SDK
 *
 * Provides functions to interact with the external endpoints of the cavos-wallet-provider service.
 *
 * @module cavos-service-sdk
 */

import axios from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper function to get Supabase client (for better testability)
function getSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || "",
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
}

const BASE_URL = 'https://services.cavos.xyz/api/v1/external';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

// Auth0 Management API functions
/**
 * Get Auth0 Management API access token
 * @returns The access token for Auth0 Management API
 */
async function getAuth0ManagementToken(): Promise<string> {
  try {
    const { data } = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
    });
    return data.access_token;
  } catch (error: any) {
    throw new Error(`Failed to get Auth0 management token: ${error.message}`);
  }
}

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

class CavosAuth {
  /**
   * Sign up a new user in an organization and create a wallet
   */
  static async signUp(
    email: string,
    password: string,
    orgId: string,
    network: string = 'sepolia',
  ): Promise<any> {
    try {
      const { data: orgData, error: orgError } = await getSupabaseClient()
        .from("org")
        .select("auth0_orgid")
        .eq("uid", orgId)
        .single();

      if (orgError || !orgData?.auth0_orgid) {
        throw new Error(`Organization not found or missing auth0_orgid for org_id: ${orgId}`);
      }

      const auth0OrgId = orgData.auth0_orgid;
      const accessToken = await getAuth0ManagementToken();
      const { data: auth0User } = await axios.post(
        `https://${AUTH0_DOMAIN}/api/v2/users`,
        {
          email,
          password,
          connection: 'Username-Password-Authentication',
          app_metadata: {
            organization_id: auth0OrgId
          },
          user_metadata: {
            organization_id: auth0OrgId
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await axios.post(
        `https://${AUTH0_DOMAIN}/api/v2/organizations/${auth0OrgId}/members`,
        {
          members: [auth0User.user_id]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const walletData = await deployWallet(network, orgId);
      const userData = {
        ...auth0User,
        wallet: walletData,
        organization: {
          org_id: orgId,
          auth0_orgid: auth0OrgId
        }
      };
      return userData;
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
   * Sign in a user to an organization and get their data including wallet
   */
  static async signIn(
    email: string,
    password: string,
    orgId: string
  ): Promise<any> {
    try {
      const { data: orgData, error: orgError } = await getSupabaseClient()
        .from("org")
        .select("auth0_orgid, id")
        .eq("uid", orgId)
        .single();
      if (orgError || !orgData?.auth0_orgid) {
        throw new Error(`Organization not found or missing auth0_orgid for org_id: ${orgId}`);
      }
      const auth0OrgId = orgData.auth0_orgid;
      const orgSupabaseId = orgData.id;
      const { data: auth0User } = await axios.post(
        `https://${AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: 'password',
          username: email,
          password: password,
          audience: `https://${AUTH0_DOMAIN}/api/v2/`,
          scope: 'openid profile email',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
        }
      );
      if (!auth0User.access_token) {
        throw new Error('Invalid credentials');
      }
      const { data: userProfile } = await axios.get(
        `https://${AUTH0_DOMAIN}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${auth0User.access_token}`,
          },
        }
      );
      const { data: walletData, error: walletError } = await getSupabaseClient()
        .from("user_wallet")
        .select("*")
        .eq("uid", userProfile.sub)
        .single();
      if (walletError) {
        throw new Error(`Wallet not found for user: ${userProfile.sub}`);
      }
      const { data: externalWalletData } = await getSupabaseClient()
        .from("external_wallet")
        .select("*")
        .eq("org_id", orgSupabaseId)
        .single();
      const userData = {
        user: {
          ...userProfile,
          access_token: auth0User.access_token,
          id_token: auth0User.id_token,
          refresh_token: auth0User.refresh_token,
        },
        wallet: walletData,
        external_wallet: externalWalletData,
        organization: {
          org_id: orgId,
          auth0_orgid: auth0OrgId,
          supabase_id: orgSupabaseId
        }
      };
      return userData;
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
   * Sign out a user by revoking their Auth0 tokens
   */
  static async signOut(accessToken: string): Promise<any> {
    try {
      await axios.post(
        `https://${AUTH0_DOMAIN}/oauth/revoke`,
        {
          token: accessToken,
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
        }
      );
      return { success: true, message: 'User signed out successfully' };
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
}

export { CavosAuth };