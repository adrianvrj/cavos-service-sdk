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

describe('CavosAuth', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock Supabase client
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

  describe('signUp', () => {
    const mockOrgData = {
      auth0_orgid: 'org_test_123',
    };

    const mockAuth0User = {
      user_id: 'auth0|test123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    const mockWalletData = {
      address: '0x1234567890abcdef',
      public_key: 'test_public_key',
      private_key: 'test_private_key',
    };

    it('should successfully sign up a user', async () => {
      // Mock Supabase response
      mockSupabaseClient.single.mockResolvedValue({
        data: mockOrgData,
        error: null,
      });

      // Mock Auth0 Management token
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'test_access_token' },
      });

      // Mock Auth0 user creation
      mockedAxios.post.mockResolvedValueOnce({
        data: mockAuth0User,
      });

      // Mock Auth0 organization member addition
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      // Mock wallet deployment
      mockedAxios.post.mockResolvedValueOnce({
        data: mockWalletData,
      });

      const result = await CavosAuth.signUp(
        'test@example.com',
        'password123',
        'org_123',
        'sepolia'
      );

      expect(result).toEqual({
        ...mockAuth0User,
        wallet: mockWalletData,
        organization: {
          org_id: 'org_123',
          auth0_orgid: 'org_test_123',
        },
      });

      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('org');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('auth0_orgid');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('uid', 'org_123');
    });

    it('should throw error when organization not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Organization not found' },
      });

      await expect(
        CavosAuth.signUp('test@example.com', 'password123', 'invalid_org')
      ).rejects.toThrow('Organization not found or missing auth0_orgid for org_id: invalid_org');
    });

    it('should throw error when organization missing auth0_orgid', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { auth0_orgid: null },
        error: null,
      });

      await expect(
        CavosAuth.signUp('test@example.com', 'password123', 'org_123')
      ).rejects.toThrow('Organization not found or missing auth0_orgid for org_id: org_123');
    });

    it('should handle Auth0 API errors', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockOrgData,
        error: null,
      });

      const errorResponse: any = {
        response: {
          status: 400,
          data: { error: 'Invalid credentials' },
        },
      };
      errorResponse.message = '400 {"error":"Invalid credentials"}';
      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(
        CavosAuth.signUp('test@example.com', 'password123', 'org_123')
      ).rejects.toThrow('signUp failed: Failed to get Auth0 management token: 400 {"error":"Invalid credentials"}');
    });
  });

  describe('signIn', () => {
    const mockOrgData = {
      auth0_orgid: 'org_test_123',
      id: 123,
    };

    const mockAuth0Tokens = {
      access_token: 'test_access_token',
      id_token: 'test_id_token',
      refresh_token: 'test_refresh_token',
    };

    const mockUserProfile = {
      sub: 'auth0|test123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockWalletData = {
      address: '0x1234567890abcdef',
      public_key: 'test_public_key',
      private_key: 'test_private_key',
      uid: 'auth0|test123',
    };

    const mockExternalWalletData = {
      address: '0xabcdef1234567890',
      org_id: 123,
    };

    it('should successfully sign in a user', async () => {
      // Mock Supabase organization query
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOrgData,
        error: null,
      });

      // Mock Auth0 authentication
      mockedAxios.post.mockResolvedValueOnce({
        data: mockAuth0Tokens,
      });

      // Mock Auth0 user profile
      mockedAxios.get.mockResolvedValueOnce({
        data: mockUserProfile,
      });

      // Mock Supabase wallet query
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockWalletData,
        error: null,
      });

      // Mock Supabase external wallet query
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExternalWalletData,
        error: null,
      });

      const result = await CavosAuth.signIn(
        'test@example.com',
        'password123',
        'org_123'
      );

      expect(result).toEqual({
        user: {
          ...mockUserProfile,
          access_token: mockAuth0Tokens.access_token,
          id_token: mockAuth0Tokens.id_token,
          refresh_token: mockAuth0Tokens.refresh_token,
        },
        wallet: mockWalletData,
        external_wallet: mockExternalWalletData,
        organization: {
          org_id: 'org_123',
          auth0_orgid: 'org_test_123',
          supabase_id: 123,
        },
      });
    });

    it('should throw error when organization not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Organization not found' },
      });

      await expect(
        CavosAuth.signIn('test@example.com', 'password123', 'invalid_org')
      ).rejects.toThrow('Organization not found or missing auth0_orgid for org_id: invalid_org');
    });

    it('should throw error when credentials are invalid', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOrgData,
        error: null,
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: null },
      });

      await expect(
        CavosAuth.signIn('test@example.com', 'wrongpassword', 'org_123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when wallet not found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOrgData,
        error: null,
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: mockAuth0Tokens,
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: mockUserProfile,
      });

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Wallet not found' },
      });

      await expect(
        CavosAuth.signIn('test@example.com', 'password123', 'org_123')
      ).rejects.toThrow('Wallet not found for user: auth0|test123');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const result = await CavosAuth.signOut('test_access_token');

      expect(result).toEqual({
        success: true,
        message: 'User signed out successfully',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test-domain.auth0.com/oauth/revoke',
        {
          token: 'test_access_token',
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
        }
      );
    });

    it('should handle Auth0 revoke errors', async () => {
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

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        CavosAuth.signOut('test_access_token')
      ).rejects.toThrow('signOut failed: Network error');
    });
  });
}); 