"use client";

import { useState, useEffect } from 'react';

interface PostResult {
  success: boolean;
  tweetId?: string;
  text?: string;
  imagePath?: string;
  error?: string;
  timestamp: string;
}

interface PostStatus {
  lastPostDate: string;
  totalPosts: number;
  successfulPosts: number;
  isWeekday: boolean;
  apiReady: boolean;
}

interface PreviewResult {
  text: string;
  imagePrompt: string;
  topic: string;
}

export default function XPostsAdmin() {
  const [status, setStatus] = useState<PostStatus | null>(null);
  const [history, setHistory] = useState<PostResult[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/x/automated');
      const data = await response.json();
      setStatus(data.status);
      setHistory(data.recentPosts || []);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePreview = async () => {
    setActionLoading('preview');
    setMessage(null);
    try {
      const response = await fetch('/api/x/automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview' })
      });
      const data = await response.json();
      if (data.success) {
        setPreview(data.preview);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate preview' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate preview' });
    }
    setActionLoading(null);
  };

  const handleForcePost = async () => {
    if (!confirm('Are you sure you want to post now? This will create a live post on X.')) {
      return;
    }
    
    setActionLoading('force');
    setMessage(null);
    try {
      const response = await fetch('/api/x/automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force', force: true })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Successfully posted! Tweet ID: ${data.tweetId}` });
        fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to post' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to post' });
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automated X Posts</h1>
        <p className="text-gray-600 mb-8">Manage AI-generated X posts for Commertize</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            {status ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Status</span>
                  <span className={`font-medium ${status.apiReady ? 'text-green-600' : 'text-red-600'}`}>
                    {status.apiReady ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Post</span>
                  <span className="font-medium text-gray-900">{status.lastPostDate || 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-medium text-gray-900">{status.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful</span>
                  <span className="font-medium text-green-600">{status.successfulPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className={`font-medium ${status.isWeekday ? 'text-green-600' : 'text-yellow-600'}`}>
                    {status.isWeekday ? 'Weekday (Posts Enabled)' : 'Weekend (Posts Disabled)'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handlePreview}
                disabled={actionLoading !== null}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'preview' ? 'Generating...' : 'Generate Preview'}
              </button>
              <button
                onClick={handleForcePost}
                disabled={actionLoading !== null || !status?.apiReady}
                className="w-full py-2 px-4 bg-[#D4A024] text-white rounded-lg hover:bg-[#B8881C] transition-colors disabled:opacity-50"
              >
                {actionLoading === 'force' ? 'Posting...' : 'Post Now'}
              </button>
            </div>
          </div>
        </div>

        {preview && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Topic</label>
                <p className="text-gray-900">{preview.topic}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tweet Content</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{preview.text}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">{preview.text.length}/280 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Image Prompt</label>
                <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">{preview.imagePrompt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h2>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((post, index) => (
                <div key={index} className={`p-4 rounded-lg border ${post.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${post.success ? 'text-green-700' : 'text-red-700'}`}>
                      {post.success ? 'Posted' : 'Failed'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {post.text && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.text}</p>
                  )}
                  {post.tweetId && (
                    <a 
                      href={`https://x.com/i/status/${post.tweetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#D4A024] hover:underline mt-2 inline-block"
                    >
                      View on X
                    </a>
                  )}
                  {post.error && (
                    <p className="text-sm text-red-600 mt-1">{post.error}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No posts yet</p>
          )}
        </div>

        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Information</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Automated posts are scheduled for:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Monday through Friday</li>
              <li>9:00 AM PST / 12:00 PM EST</li>
              <li>One AI-generated post per day</li>
              <li>Each post includes a DALL-E generated image</li>
            </ul>
            <p className="mt-4">Topics covered: Real estate tokenization, RWA, AI-powered investing, Commertize platform updates, and commercial real estate innovation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
