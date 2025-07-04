import CavosAuth from '../index';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CavosAuth Integration Tests', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    // Mock the createClient to return our mock client
    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue(mockSupabaseClient);
  });

  describe('Complete User Lifecycle', () => {
    const testEmail = 'integration@test.com';
    const testPassword = 'securePassword123';
    const testOrgId = 'test_org_123';
    const testNetwork = 'sepolia';

    const mockOrgData = {
      auth0_orgid: 'org_integration_123',
      id: 456,
    };

    const mockAuth0User = {
      user_id: 'auth0|integration123',
      email: testEmail,
      created_at: '2024-01-01T00:00:00Z',
    };

    const mockWalletData = {
      address: '0xintegration1234567890abcdef',
      public_key: 'integration_public_key',
      private_key: 'integration_private_key',
    };

    const mockAuth0Tokens = {
      access_token: 'integration_access_token',
      id_token: 'integration_id_token',
      refresh_token: 'integration_refresh_token',
    };

    const mockUserProfile = {
      sub: 'auth0|integration123',
      email: testEmail,
      name: 'Integration Test User',
    };

    const mockUserWalletData = {
      address: '0xintegration1234567890abcdef',
      public_key: 'integration_public_key',
      private_key: 'integration_private_key',
      uid: 'auth0|integration123',
    };

    it('should handle complete user lifecycle: signUp -> signIn -> signOut', async () => {
      // Step 1: Sign Up
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOrgData,
        error: null,
      });

      mockedAxios.post
        .mockResolvedValueOnce({ data: { access_token: 'management_token' } }) // Auth0 Management token
        .mockResolvedValueOnce({ data: mockAuth0User }) // Auth0 user creation
        .mockResolvedValueOnce({ data: { success: true } }) // Add to organization
        .mockResolvedValueOnce({ data: mockWalletData }); // Wallet deployment

      const signUpResult = await CavosAuth.signUp(
        testEmail,
        testPassword,
        testOrgId,
        testNetwork
      );

      expect(signUpResult).toEqual({
        ...mockAuth0User,
        wallet: mockWalletData,
        organization: {
          org_id: testOrgId,
          auth0_orgid: mockOrgData.auth0_orgid,
        },
      });

      // Step 2: Sign In
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockOrgData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUserWalletData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null, // No external wallet
          error: null,
        });

      mockedAxios.post.mockResolvedValueOnce({
        data: mockAuth0Tokens,
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: mockUserProfile,
      });

      const signInResult = await CavosAuth.signIn(
        testEmail,
        testPassword,
        testOrgId
      );

      expect(signInResult).toEqual({
        user: {
          ...mockUserProfile,
          access_token: mockAuth0Tokens.access_token,
          id_token: mockAuth0Tokens.id_token,
          refresh_token: mockAuth0Tokens.refresh_token,
        },
        wallet: mockUserWalletData,
        external_wallet: null,
        organization: {
          org_id: testOrgId,
          auth0_orgid: mockOrgData.auth0_orgid,
          supabase_id: mockOrgData.id,
        },
      });

      // Step 3: Sign Out
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const signOutResult = await CavosAuth.signOut(mockAuth0Tokens.access_token);

      expect(signOutResult).toEqual({
        success: true,
        message: 'User signed out successfully',
      });

      // Verify all expected calls were made
      expect(mockedAxios.post).toHaveBeenCalledTimes(6); // 4 for signUp, 1 for signIn, 1 for signOut
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // 1 for user profile
    });

    it('should handle errors gracefully in the lifecycle', async () => {
      // Start with successful sign up
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOrgData,
        error: null,
      });

      mockedAxios.post
        .mockResolvedValueOnce({ data: { access_token: 'management_token' } })
        .mockResolvedValueOnce({ data: mockAuth0User })
        .mockResolvedValueOnce({ data: { success: true } })
        .mockResolvedValueOnce({ data: mockWalletData });

      await CavosAuth.signUp(testEmail, testPassword, testOrgId, testNetwork);

      // Try to sign in with wrong password
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOrgData,
        error: null,
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: null }, // Invalid credentials
      });

      await expect(
        CavosAuth.signIn(testEmail, 'wrongpassword', testOrgId)
      ).rejects.toThrow('Invalid credentials');

      // Try to sign out with invalid token
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Invalid token' },
        },
      });

      await expect(
        CavosAuth.signOut('invalid_token')
      ).rejects.toThrow('signOut failed: 400 {"error":"Invalid token"}');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network failures', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { auth0_orgid: 'org_test_123' },
        error: null,
      });

      mockedAxios.post.mockRejectedValue(new Error('Network timeout'));

      await expect(
        CavosAuth.signUp('test@example.com', 'password123', 'org_123')
      ).rejects.toThrow('signUp failed: Failed to get Auth0 management token: Network timeout');
    });

    it('should handle malformed responses', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { auth0_orgid: 'org_test_123' },
        error: null,
      });

      mockedAxios.post.mockResolvedValue({
        data: null, // Malformed response
      });

      await expect(
        CavosAuth.signUp('test@example.com', 'password123', 'org_123')
      ).rejects.toThrow('signUp failed: Failed to get Auth0 management token: Cannot read properties of null (reading \'access_token\')');
    });
  });
}); 