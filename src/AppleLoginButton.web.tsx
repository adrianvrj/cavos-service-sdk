import React from 'react';

export type AppleLoginButtonProps = {
  orgToken: string;
  network: string;
  onSuccess: (user: any) => void;
  onError: (err: any) => void;
  children?: React.ReactNode;
};

export const AppleLoginButton: React.FC<AppleLoginButtonProps> = ({ orgToken, network, onSuccess, onError, children }) => {
  const baseUrl = "https://services.cavos.xyz";
  const handleLogin = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/external/auth/apple?network=${encodeURIComponent(network)}`, {
        headers: { Authorization: `Bearer ${orgToken}` },
      });
      if (!res.ok) throw new Error('Failed to get Apple login URL');
      const data = await res.json();
      const url = data.url;
      window.location.href = url;
    } catch (err) {
      onError(err);
    }
  };
  return (
    <button type="button" onClick={handleLogin}>
      {children || 'Sign in with Apple'}
    </button>
  );
}; 