'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface PostingCalendarFormHandle {
  getData: () => any
}

interface PostingCalendarFormProps {
  content: any
  onChange: (content: any) => void
}

interface Post {
  id: string
  date: string
  time: string
  platform: string
  contentType: string
  caption: string
  hashtags: string
  notes: string
  status: 'draft' | 'scheduled' | 'posted'
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E1306C' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { id: 'facebook', name: 'Facebook', icon: '👍', color: '#1877F2' },
  { id: 'twitter', name: 'X', icon: '🐦', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' }
]

const PostingCalendarForm = forwardRef<PostingCalendarFormHandle, PostingCalendarFormProps>(
  ({ content, onChange }, ref) => {
    const [posts, setPosts] = useState<Post[]>(() => {
      if (content && Array.isArray(content.posts)) {
        return content.posts
      }
      return []
    })

    const [filterPlatform, setFilterPlatform] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useImperativeHandle(ref, () => ({
      getData: () => ({ posts })
    }))

    useEffect(() => {
      onChange({ posts })
    }, [posts])

    const addPost = () => {
      const today = new Date().toISOString().split('T')[0]
      const newPost: Post = {
        id: `post-${Date.now()}`,
        date: today,
        time: '12:00',
        platform: 'instagram',
        contentType: '',
        caption: '',
        hashtags: '',
        notes: '',
        status: 'draft'
      }
      setPosts([...posts, newPost])
    }

    const updatePost = (id: string, field: keyof Post, value: any) => {
      setPosts(posts.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const removePost = (id: string) => {
      setPosts(posts.filter(p => p.id !== id))
    }

    const duplicatePost = (id: string) => {
      const postToDupe = posts.find(p => p.id === id)
      if (postToDupe) {
        const newPost = {
          ...postToDupe,
          id: `post-${Date.now()}`,
          status: 'draft' as const
        }
        setPosts([...posts, newPost])
      }
    }

    const getPlatformIcon = (platformId: string) => {
      return platforms.find(p => p.id === platformId)?.icon || '📱'
    }

    const getPlatformColor = (platformId: string) => {
      return platforms.find(p => p.id === platformId)?.color || '#8EA091'
    }

    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

    const filteredPosts = sortedPosts.filter(post => {
      if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false
      if (filterStatus !== 'all' && post.status !== filterStatus) return false
      return true
    })

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-700'
        case 'scheduled': return 'bg-blue-100 text-blue-700'
        case 'posted': return 'bg-green-100 text-green-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    }

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="font-semibold text-[#1D1D1F] flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Posting Calendar
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Schedule and plan your content posts ({posts.length} posts total)
          </p>
        </div>

        {/* Filters & Add Button */}
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Platforms</option>
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="posted">Posted</option>
            </select>
          </div>

          <button
            onClick={addPost}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
          >
            + Add Post
          </button>
        </div>

        {/* Posts List */}
        <div className="p-6 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <span className="text-6xl block mb-4">📅</span>
              <p className="text-gray-500 mb-2">
                {posts.length === 0 ? 'No posts yet' : 'No posts match filters'}
              </p>
              <p className="text-sm text-gray-400">
                {posts.length === 0 ? 'Click "Add Post" to schedule your first post' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const platformColor = getPlatformColor(post.platform)
              return (
                <div
                  key={post.id}
                  className="border-2 rounded-lg overflow-hidden"
                  style={{ borderColor: platformColor + '40' }}
                >
                  {/* Post Header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: platformColor + '10' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={post.date}
                          onChange={(e) => updatePost(post.id, 'date', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                        />
                        <input
                          type="time"
                          value={post.time}
                          onChange={(e) => updatePost(post.id, 'time', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                        />
                      </div>
                      <select
                        value={post.status}
                        onChange={(e) => updatePost(post.id, 'status', e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(post.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="posted">Posted</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicatePost(post.id)}
                        className="px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => removePost(post.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Post Details */}
                  <div className="p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Platform
                        </label>
                        <select
                          value={post.platform}
                          onChange={(e) => updatePost(post.id, 'platform', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {platforms.map(p => (
                            <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Content Type
                        </label>
                        <input
                          type="text"
                          value={post.contentType}
                          onChange={(e) => updatePost(post.id, 'contentType', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Reel, Photo, Carousel"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Caption
                      </label>
                      <textarea
                        value={post.caption}
                        onChange={(e) => updatePost(post.id, 'caption', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        placeholder="Write your post caption..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Hashtags
                      </label>
                      <input
                        type="text"
                        value={post.hashtags}
                        onChange={(e) => updatePost(post.id, 'hashtags', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="#hashtag1 #hashtag2 #hashtag3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={post.notes}
                        onChange={(e) => updatePost(post.id, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                        placeholder="Internal notes, asset links, collaborators..."
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h3 className="font-semibold text-pink-900 mb-2 text-sm">💡 Posting Calendar Tips</h3>
            <ul className="text-sm text-pink-800 space-y-1">
              <li>• Plan 1-2 weeks ahead to stay consistent</li>
              <li>• Post during peak engagement times for each platform</li>
              <li>• Balance content types (promotional, educational, entertaining)</li>
              <li>• Use the duplicate feature to repurpose content across platforms</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
)

PostingCalendarForm.displayName = 'PostingCalendarForm'

export default PostingCalendarForm
