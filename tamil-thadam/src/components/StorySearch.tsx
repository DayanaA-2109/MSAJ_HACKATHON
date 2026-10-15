'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Story = {
  id: string
  title: string
  description: string | null
  district: string
  topic: string
}

type Option = {
  id: number
  name_ta: string
}

export default function StorySearch() {
  const [stories, setStories] = useState<Story[]>([])
  const [districts, setDistricts] = useState<Option[]>([])
  const [topics, setTopics] = useState<Option[]>([])
  const [search, setSearch] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load district and topic dropdowns
  useEffect(() => {
    let active = true

    async function loadOptions() {
      const [districtResult, topicResult] = await Promise.all([
        supabase
          .from('districts')
          .select('id, name_ta')
          .order('name_en'),
        supabase
          .from('topics')
          .select('id, name_ta')
          .order('name_en'),
      ])

      if (!active) return

      if (districtResult.error || topicResult.error) {
        setError(
          districtResult.error?.message ||
            topicResult.error?.message ||
            'தகவல்களைப் பெற முடியவில்லை'
        )
        return
      }

      setDistricts(districtResult.data || [])
      setTopics(topicResult.data || [])
    }

    loadOptions()

    return () => {
      active = false
    }
  }, [])

  // Load and filter stories
  useEffect(() => {
    let active = true

    async function loadStories() {
      setLoading(true)
      setError('')

      try {
        let query = supabase
          .from('stories')
          .select(
            'id, title, description, district_id, topic_id'
          )
          .eq('is_published', true)
          .eq('consent_given', true)
          .order('created_at', { ascending: false })

        if (search.trim()) {
          const term = search.trim().replace(/[,%()]/g, ' ')

          query = query.or(
            `title.ilike.%${term}%,description.ilike.%${term}%`
          )
        }

        if (districtId) {
          query = query.eq('district_id', Number(districtId))
        }

        if (topicId) {
          query = query.eq('topic_id', Number(topicId))
        }

        const { data, error: queryError } = await query

        if (!active) return

        if (queryError) {
          setError(queryError.message)
          setStories([])
          return
        }

        const districtNames = new Map(
          districts.map((item) => [item.id, item.name_ta])
        )

        const topicNames = new Map(
          topics.map((item) => [item.id, item.name_ta])
        )

        setStories(
          (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            district:
              districtNames.get(item.district_id) || '',
            topic:
              topicNames.get(item.topic_id) || '',
          }))
        )
      } catch (err) {
        if (!active) return

        setError(
          err instanceof Error
            ? err.message
            : 'கதைகளைப் பெற முடியவில்லை'
        )
        setStories([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStories()

    return () => {
      active = false
    }
  }, [search, districtId, topicId, districts, topics])

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-2 text-2xl font-bold">
        வாய்மொழி வரலாற்றுத் தேடல்
      </h2>

      <p className="mb-5 text-gray-600">
        கதைகளைத் தேடுங்கள்; மாவட்டம் மற்றும் தலைப்பின்படி வடிகட்டுங்கள்.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="கதையைத் தேடுங்கள்..."
          aria-label="கதையைத் தேடுங்கள்"
          className="rounded-lg border p-3"
        />

        <select
          value={districtId}
          onChange={(event) => setDistrictId(event.target.value)}
          aria-label="மாவட்டத்தைத் தேர்ந்தெடுக்கவும்"
          className="rounded-lg border p-3"
        >
          <option value="">அனைத்து மாவட்டங்களும்</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name_ta}
            </option>
          ))}
        </select>

        <select
          value={topicId}
          onChange={(event) => setTopicId(event.target.value)}
          aria-label="தலைப்பைத் தேர்ந்தெடுக்கவும்"
          className="rounded-lg border p-3"
        >
          <option value="">அனைத்து தலைப்புகளும்</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name_ta}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-5 text-red-600">பிழை: {error}</p>
      )}

      {loading ? (
        <p className="mt-6">கதைகள் ஏற்றப்படுகின்றன...</p>
      ) : !error && stories.length === 0 ? (
        <p className="mt-6">கதைகள் எதுவும் கிடைக்கவில்லை.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stories.map((story) => (
            <article
              key={story.id}
              className="rounded-xl border p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold">
                {story.title}
              </h3>

              <p className="mt-2 text-gray-700">
                {story.description}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                மாவட்டம்: {story.district || 'குறிப்பிடப்படவில்லை'}
              </p>

              <p className="text-sm text-gray-500">
                தலைப்பு: {story.topic || 'குறிப்பிடப்படவில்லை'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}