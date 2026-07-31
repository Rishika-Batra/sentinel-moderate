import React, { useState, useRef } from 'react';
import api from '../lib/api';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface PostFormProps {
  onPostCreated: () => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Text is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (image) {
        formData.append('image', image);
      }
      
      await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setText('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      onPostCreated();
    } catch (err) {
      console.error(err);
      setError("Couldn't submit post — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="ts-card p-6">
      <h2 className="text-lg font-semibold mb-6">Create New Post</h2>
      
      {error && (
        <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="postText" className="ts-label">Post Text</label>
          <textarea
            id="postText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="ts-input resize-none"
            placeholder="Enter the content to be evaluated..."
          />
        </div>
        
        <div>
          <label className="ts-label">Attachment (Optional)</label>
          
          {!image ? (
            <div 
              className="mt-2 flex justify-center rounded-lg border border-dashed border-ts-border px-6 py-8 hover:border-ts-accent/50 hover:bg-ts-accent/5 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-ts-text-muted mb-3" />
                <div className="mt-2 flex justify-center text-sm leading-6 text-ts-text-muted">
                  <span className="relative rounded-md font-medium text-ts-accent hover:text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-ts-accent">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" ref={fileInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-ts-text-placeholder mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between p-3 border border-ts-border rounded-lg bg-ts-input-bg">
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-5 h-5 text-ts-accent" />
                <span className="text-sm text-ts-text-main">{image.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setImage(null)}
                className="text-ts-text-muted hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t border-ts-border">
          <button type="submit" disabled={loading} className="ts-button-primary">
            {loading ? 'Submitting...' : 'Submit to Queue'}
          </button>
        </div>
      </form>
    </div>
  );
}
