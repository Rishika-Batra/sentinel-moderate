import { useState, useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostFeed from '../components/PostFeed';
import GoogleSignIn from '../components/GoogleSignIn';
import Header from '../components/Header';
import LuminousRibbonBackground from '../components/LuminousRibbonBackground';
import { GridBackground } from '../components/GridBackground';
import api from '../lib/api';
import { Shield } from 'lucide-react';

interface User {
  name: string;
  email: string;
  picture?: string;
}

function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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
    return (
      <div className="min-h-screen flex flex-col relative z-10">
        <Header user={user} onUserLogout={handleLogout} />
        <div className="max-w-3xl mx-auto px-4 py-12 text-ts-textMuted text-sm">Loading...</div>
      </div>
    );
  }

  // SIGNED OUT: Render Luminous Ribbon Animation + Login Card
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative bg-black overflow-hidden p-4 animate-fade-slide-up">
        <LuminousRibbonBackground />
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            boxShadow: isHovered
              ? '0 0 70px 15px rgba(45, 212, 191, 0.85), 0 0 30px 5px rgba(45, 212, 191, 0.95)'
              : '0 10px 40px -10px rgba(0, 0, 0, 0.8)',
            borderColor: isHovered ? '#2DD4BF' : '#232B42',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="ts-card p-8 md:p-10 text-center flex flex-col items-center justify-center max-w-[420px] w-full bg-ts-surface/95 backdrop-blur-md rounded-2xl border select-none relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div 
              style={{
                borderColor: isHovered ? '#2DD4BF' : 'rgba(45, 212, 191, 0.2)',
                backgroundColor: isHovered ? 'rgba(45, 212, 191, 0.25)' : 'rgba(45, 212, 191, 0.1)',
                transition: 'all 0.4s ease',
              }}
              className="p-2.5 rounded-xl border"
            >
              <Shield className="w-7 h-7 text-ts-accent" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold tracking-tight text-ts-textMain">Sentinel</h2>
              <p className="text-xs text-ts-textMuted uppercase tracking-wider font-medium">Moderation Platform</p>
            </div>
          </div>
          <p className="text-sm text-ts-textMuted mb-6 leading-relaxed">
            Sign in with your account to submit content to the moderation processing queue.
          </p>
          <GoogleSignIn onSignedIn={setUser} />
        </div>
      </div>
    );
  }

  // SIGNED IN: Complaints & Submissions Page with clean dark background (NO ribbon animations)
  return (
    <div className="min-h-screen flex flex-col w-full relative z-10 bg-ts-bg">
      <GridBackground />
      <Header user={user} onUserLogout={handleLogout} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 animate-fade-slide-up w-full">
        <div className="mb-8 border-b border-ts-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ts-textMain mb-1">Content Submission</h1>
          <p className="text-sm text-ts-textMuted">Submit content for automated AI moderation processing.</p>
        </div>

        <div className="space-y-8">
          <PostForm onPostCreated={handlePostCreated} />
          <PostFeed refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}

export default Home;
