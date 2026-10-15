
'use client'

import { useState } from 'react'

export default function UploadAudioPage() {
  const [storyId, setStoryId] = useState('')
  const [token, setToken] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('audio', file!)
      formData.append('storyId', storyId.trim())

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        headers: { 'x-upload-token': token },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setMessage('Audio uploaded successfully!')
      setFile(null)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Upload failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1>தமிழ் தடம் — Audio Upload</h1>
      <p>Upload an audio recording for an existing published story.</p>

      <form onSubmit={handleUpload}>
        <label htmlFor="storyId">Story ID (UUID)</label>
        <input
          id="storyId"
          value={storyId}
          onChange={(e) => setStoryId(e.target.value)}
          required
          style={{ display: 'block', width: '100%', margin: '8px 0 16px', padding: 10 }}
        />

        <label htmlFor="audio">Audio file (max 25 MB)</label>
        <input
          id="audio"
          type="file"
          accept="audio/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: 'block', margin: '8px 0 16px' }}
        />

        <label htmlFor="token">Demo upload token</label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          autoComplete="off"
          style={{ display: 'block', width: '100%', margin: '8px 0 16px', padding: 10 }}
        />

        <button
          type="submit"
          disabled={loading || !file}
          style={{ padding: '10px 18px', cursor: 'pointer' }}
        >
          {loading ? 'Uploading...' : 'Upload Audio'}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </main>
  )
}
