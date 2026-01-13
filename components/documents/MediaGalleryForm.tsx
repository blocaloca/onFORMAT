'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface MediaGalleryFormHandle {
  getData: () => any
}

interface MediaGalleryFormProps {
  content: any
  onChange: (content: any) => void
  documentType: string
}

interface MediaItem {
  id: string
  url: string
  caption: string
  notes: string
}

const MediaGalleryForm = forwardRef<MediaGalleryFormHandle, MediaGalleryFormProps>(
  ({ content, onChange, documentType }, ref) => {
    const [items, setItems] = useState<MediaItem[]>(() => {
      if (content && Array.isArray(content.items)) {
        return content.items
      }
      return []
    })

    const [newImageUrl, setNewImageUrl] = useState('')

    useImperativeHandle(ref, () => ({
      getData: () => ({ items })
    }))

    useEffect(() => {
      onChange({ items })
    }, [items])

    const addImage = () => {
      if (!newImageUrl.trim()) return

      const newItem: MediaItem = {
        id: `media-${Date.now()}`,
        url: newImageUrl.trim(),
        caption: '',
        notes: ''
      }
      setItems([...items, newItem])
      setNewImageUrl('')
    }

    const updateItem = (id: string, field: keyof MediaItem, value: string) => {
      setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    const removeItem = (id: string) => {
      setItems(items.filter(item => item.id !== id))
    }

    const getTitle = () => {
      return documentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <h2 className="font-semibold text-[#1D1D1F]">{getTitle()}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Add images with captions and notes ({items.length} images)
          </p>
        </div>

        {/* Add New Image */}
        <div className="p-6 border-b border-[#E5E5EA] bg-purple-50">
          <h3 className="font-semibold text-[#1D1D1F] mb-3">Add Image</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
              className="flex-1 px-4 py-2 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Paste image URL here..."
            />
            <button
              onClick={addImage}
              disabled={!newImageUrl.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Paste URLs from Unsplash, Pinterest, or upload to Imgur/CloudFlare and paste the link
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <span className="text-6xl block mb-4">🖼️</span>
              <p className="text-gray-500 mb-2">No images yet</p>
              <p className="text-sm text-gray-400">Add image URLs above to build your {getTitle().toLowerCase()}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 border border-[#E5E5EA] rounded-lg overflow-hidden">
                  {/* Image */}
                  <div className="aspect-video bg-gray-200 relative">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.caption || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No URL
                      </div>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => updateItem(item.id, 'caption', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Brief description..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Notes
                      </label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                        placeholder="Why this image? Color palette? Mood?..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                        className="w-full px-2 py-1 border border-[#E5E5EA] rounded text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        {items.length > 0 && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">💡 {getTitle()} Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {documentType.includes('mood') && (
                  <>
                    <li>• Collect 8-12 images that capture the visual tone</li>
                    <li>• Include color palettes, lighting styles, and compositions</li>
                    <li>• Note why each image is relevant to the project</li>
                  </>
                )}
                {documentType.includes('storyboard') && (
                  <>
                    <li>• Each frame should show shot composition and camera angle</li>
                    <li>• Include notes about camera movement and duration</li>
                    <li>• Number frames in shooting order</li>
                  </>
                )}
                {documentType.includes('art-book') && (
                  <>
                    <li>• Collect reference images for art direction</li>
                    <li>• Include set design, props, wardrobe inspiration</li>
                    <li>• Organize by scene or category</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    )
  }
)

MediaGalleryForm.displayName = 'MediaGalleryForm'

export default MediaGalleryForm
