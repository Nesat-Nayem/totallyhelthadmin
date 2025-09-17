import { API_BASE_URL } from '@/utils/env'

export async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('backend_token') : null

  const res = await fetch(`${API_BASE_URL}/upload/single`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Upload failed')
  }
  const data = await res.json()
  const url = data?.data?.url as string | undefined
  if (!url) throw new Error('Upload response missing url')
  return url
}
