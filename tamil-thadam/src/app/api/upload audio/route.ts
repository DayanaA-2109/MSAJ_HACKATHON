import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('x-upload-token')

    if (
      !process.env.TAMIL_THADAM_UPLOAD_TOKEN ||
      token !== process.env.TAMIL_THADAM_UPLOAD_TOKEN
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('audio')
    const storyId = formData.get('storyId')

    if (!(file instanceof File) || typeof storyId !== 'string') {
      return NextResponse.json(
        { error: 'Audio file and story ID are required' },
        { status: 400 }
      )
    }

    if (!/^[0-9a-f-]{36}$/i.test(storyId)) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      )
    }

    if (file.size === 0 || file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio must be between 1 byte and 25 MB' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/x-m4a',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format' },
        { status: 400 }
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SECRET_KEY

    if (!url || !key) {
      return NextResponse.json(
        { error: 'Server configuration is missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(url, key)

    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .eq('is_published', true)
      .eq('consent_given', true)
      .maybeSingle()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Published, consented story not found' },
        { status: 404 }
      )
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'audio'
    const path = `${storyId}/${randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('oral-history-audio')
      .upload(path, file, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Audio upload failed', details: uploadError.message },
        { status: 500 }
      )
    }

    const { error: dbError } = await supabase
      .from('audio_files')
      .insert({
        story_id: storyId,
        storage_path: path,
      })

    if (dbError) {
      await supabase.storage.from('oral-history-audio').remove([path])

      return NextResponse.json(
        { error: 'Could not save audio metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Audio uploaded' })
  } catch {
    return NextResponse.json(
      { error: 'Unexpected upload error' },
      { status: 500 }
    )
  }
}