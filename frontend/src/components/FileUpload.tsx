import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadApi } from '@/services/api'

interface Props {
  currentUrl?: string
  onUploaded: (url: string) => void
}

export default function FileUpload({ currentUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert('Only JPEG, PNG, GIF, WebP images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)')
      return
    }

    setUploading(true)
    try {
      const url = await uploadApi.uploadImage(file)
      setPreview(url)
      onUploaded(url)
    } catch {
      alert('Upload failed')
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-3">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="" className="h-14 w-14 rounded-lg object-cover border" onError={e => (e.target as HTMLImageElement).src = ''} />
          <button onClick={() => { setPreview(''); onUploaded('') }} className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
          <Upload className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFile} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Choose File'}
        </label>
        <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP (max 5MB)</p>
      </div>
    </div>
  )
}
