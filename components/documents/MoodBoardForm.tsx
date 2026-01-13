'use client'

import { useState } from 'react'
import { uploadImage, deleteImage } from '@/lib/upload-image'

interface MoodBoardFormProps {
  content: any
  onChange: (content: any) => void
}

export default function MoodBoardForm({ content, onChange }: MoodBoardFormProps) {
  const [images, setImages] = useState<string[]>(content?.images || [])
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState(content?.notes || '')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file))
      const urls = await Promise.all(uploadPromises)

      const updated = [...images, ...urls]
      setImages(updated)
      onChange({ images: updated, notes })

    } catch (error: any) {
      alert(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (index: number, url: string) => {
    if (confirm('Delete this image?')) {
      await deleteImage(url)
      const updated = images.filter((_, i) => i !== index)
      setImages(updated)
      onChange({ images: updated, notes })
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    onChange({ images, notes: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-3">Mood Board Images</label>

        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Uploading images...</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-3xl mb-2">📸</p>
              <p className="text-lg font-medium text-gray-700 mb-1">Click to upload images</p>
              <p className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">{images.length} image{images.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Mood board ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleRemoveImage(index, url)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add notes about the mood and visual direction..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[#1D1D1F]"
        />
      </div>
    </div>
  )
}
