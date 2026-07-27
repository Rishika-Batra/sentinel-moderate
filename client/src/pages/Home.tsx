import { useState } from 'react';
import PostForm from '../components/PostForm';
import PostFeed from '../components/PostFeed';

function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-slide-up w-full">
      <header className="mb-8 border-b border-ts-border pb-6">
        <h1 className="text-2xl font-semibold mb-2">Content Submission</h1>
        <p className="text-sm text-ts-text-muted">Submit content for moderation processing.</p>
      </header>
      
      <main className="space-y-8">
        <PostForm onPostCreated={handlePostCreated} />
        <PostFeed refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default Home;
