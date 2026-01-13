import { supabase } from './supabase'

export async function uploadImage(file: File): Promise<string> {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be under 5MB')
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

    console.log('📤 Uploading to bucket "project-images":', fileName)

    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Upload error:', error)

      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        throw new Error('Storage bucket "project-images" not found. Please create it in Supabase Dashboard → Storage → New Bucket (name: project-images, public: true)')
      }

      throw new Error(error.message || 'Failed to upload image')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName)

    console.log('✅ Uploaded successfully:', publicUrl)
    return publicUrl

  } catch (error: any) {
    console.error('❌ Upload failed:', error)
    throw error
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const fileName = url.split('/').pop()
    if (!fileName) return

    await supabase.storage
      .from('project-images')
      .remove([fileName])

  } catch (error) {
    console.error('Delete failed:', error)
  }
}
