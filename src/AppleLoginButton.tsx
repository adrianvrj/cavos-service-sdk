import React from 'react';

// Detect platform
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const baseUrl = "https://services.cavos.xyz"

export type AppleLoginButtonProps = {
  orgToken: string;
  network: string;
  onSuccess: (user: any) => void;
  onError: (err: any) => void;
  children?: React.ReactNode;
};

export const AppleLoginButton: React.FC<AppleLoginButtonProps> = ({
  orgToken,
  network,
  onSuccess,
  onError,
  children,
}: AppleLoginButtonProps) => {
  const handleLogin = async () => {
    try {
      // Obtener la URL de login de Apple
      const res = await fetch(`${baseUrl}/api/v1/external/auth/apple?network=${encodeURIComponent(network)}`, {
        headers: { Authorization: `Bearer ${orgToken}` },
      });
      if (!res.ok) throw new Error('Failed to get Apple login URL');
      const data = await res.json();
      const url = data.url;

      if (isWeb) {
        window.location.href = url;
      } else {
        // React Native: abrir navegador externo
        // @ts-ignore
        const { Linking } = require('react-native');
        Linking.openURL(url);
        // El flujo de callback debe ser manejado por la app (deep link)
      }
    } catch (err) {
      onError(err);
    }
  };

  // Botón universal
  if (isWeb) {
    return (
      <button type="button" onClick={handleLogin}>
        {children || 'Sign in with Apple'}
      </button>
    );
  } else {
    // React Native
    // @ts-ignore
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={handleLogin}>
        {children || <Text>Sign in with Apple</Text>}
      </TouchableOpacity>
    );
  }
};

// Utilidad para manejar el callback (web o mobile)
export async function handleAppleCallback({ code, network, org_id }: { code: string, network: string, org_id: string }) {
  const url = `${baseUrl}/api/v1/external/auth/apple/callback?code=${encodeURIComponent(code)}&network=${encodeURIComponent(network)}&org_id=${encodeURIComponent(org_id)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to handle Apple callback');
  return await res.json();
} 