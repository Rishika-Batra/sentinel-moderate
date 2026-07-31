import { useState, useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostFeed from '../components/PostFeed';
import GoogleSignIn from '../components/GoogleSignIn';
import api from '../lib/api';

interface User {
  name: string;
  email: string;
  picture?: string;
}

function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  if (checkingSession) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-ts-text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-slide-up w-full">
      <header className="mb-8 border-b border-ts-border pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Content Submission</h1>
          <p className="text-sm text-ts-text-muted">Submit content for moderation processing.</p>
        </div>
        {user && (
          <button onClick={handleLogout} className="text-sm text-ts-text-muted hover:text-ts-text-main">
            Log out ({user.name})
          </button>
        )}
      </header>

      {!user ? (
        <div className="ts-card p-8 text-center">
          <p className="text-sm text-ts-text-muted mb-4">Sign in to submit content.</p>
          <GoogleSignIn onSignedIn={setUser} />
        </div>
      ) : (
        <main className="space-y-8">
          <PostForm onPostCreated={handlePostCreated} />
          <PostFeed refreshTrigger={refreshTrigger} />
        </main>
      )}
    </div>
  );
}

export default Home;
