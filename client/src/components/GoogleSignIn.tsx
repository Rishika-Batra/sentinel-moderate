import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '../lib/api';

interface GoogleSignInProps {
  onSignedIn: (user: { name: string; email: string; picture?: string }) => void;
}

export default function GoogleSignIn({ onSignedIn }: GoogleSignInProps) {
  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    try {
      const res = await api.post('/api/auth/google', { credential: response.credential });
      onSignedIn(res.data.user);
    } catch (err) {
      console.error('Google sign-in failed:', err);
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={() => console.error('Google login failed')} />
    </div>
  );
}
