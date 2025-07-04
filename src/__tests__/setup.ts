// Test setup file
process.env.AUTH0_DOMAIN = 'test-domain.auth0.com';
process.env.AUTH0_CLIENT_ID = 'test-client-id';
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
process.env.AUTH0_M2M_CLIENT_ID = 'test-m2m-client-id';
process.env.AUTH0_M2M_CLIENT_SECRET = 'test-m2m-client-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Global test timeout
jest.setTimeout(10000); 