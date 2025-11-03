import { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, Bookmark, Send, X } from 'lucide-react';
import { supabase, Discussion, DiscussionReply } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Discussions() {
  const { profile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles!discussions_author_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          author:profiles!discussion_replies_author_id_fkey(full_name, avatar_url)
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await supabase.from('discussions').insert([{
        ...newDiscussion,
        author_id: profile.id,
      }]);

      setShowNewModal(false);
      setNewDiscussion({ title: '', content: '' });
      loadDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedDiscussion) return;

    try {
      await supabase.from('discussion_replies').insert([{
        discussion_id: selectedDiscussion.id,
        content: replyContent,
        author_id: profile.id,
      }]);

      setReplyContent('');
      loadReplies(selectedDiscussion.id);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLike = async (discussionId: string) => {
    if (!profile) return;

    try {
      const { data: existingLike } = await supabase
        .from('discussion_likes')
        .select('id')
        .eq('user_id', profile.id)
        .eq('discussion_id', discussionId)
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from('discussion_likes')
          .delete()
          .eq('id', existingLike.id);

        await supabase.rpc('decrement_likes', { discussion_id: discussionId });
      } else {
        await supabase
          .from('discussion_likes')
          .insert([{ user_id: profile.id, discussion_id: discussionId }]);

        await supabase.rpc('increment_likes', { discussion_id: discussionId });
      }

      loadDiscussions();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (discussionId: string) => {
    if (!profile) return;

    try {
      const { data: existingBookmark } = await supabase
        .from('discussion_bookmarks')
        .select('id')
        .eq('user_id', profile.id)
        .eq('discussion_id', discussionId)
        .maybeSingle();

      if (existingBookmark) {
        await supabase
          .from('discussion_bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
      } else {
        await supabase
          .from('discussion_bookmarks')
          .insert([{ user_id: profile.id, discussion_id: discussionId }]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    loadReplies(discussion.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Discussion Forum</h2>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <MessageSquare size={20} />
          New Discussion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => openDiscussion(discussion)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {discussion.author?.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {discussion.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{discussion.author?.full_name}</span>
                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLike(discussion.id); }}
                          className="flex items-center gap-1 hover:text-blue-500"
                        >
                          <ThumbsUp size={14} />
                          {discussion.likes_count}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookmark(discussion.id); }}
                          className="flex items-center gap-1 hover:text-blue-500"
                        >
                          <Bookmark size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedDiscussion && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white">Replies</h3>
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        {reply.author?.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {reply.author?.full_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {reply.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">New Discussion</h3>
            </div>

            <form onSubmit={handleCreateDiscussion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Discussion
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewModal(false); setNewDiscussion({ title: '', content: '' }); }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
