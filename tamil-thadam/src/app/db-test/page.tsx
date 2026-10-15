
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Story = {
  id: string
  title: string
  description: string | null
  language: string | null
  district_id: string
  districts: { name_en: string; name_ta: string } | null
}

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStories() {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, description, language, district_id, districts(name_en, name_ta)')
        .eq('is_published', true)
        .eq('consent_given', true)
        .order('title')

      if (error) {
        console.error(error)
      } else {
        setStories((data ?? []) as unknown as Story[])
      }

      setLoading(false)
    }

    loadStories()
  }, [])

  const districts = [
    'Chennai',
    'Coimbatore',
    'Thoothukudi',
    'Madurai',
    'Villupuram',
    'Salem',
  ]

  const visibleStories = stories.filter(story => {
    const text = `${story.title} ${story.description ?? ''} ${story.districts?.name_en ?? ''} ${story.districts?.name_ta ?? ''}`
    return text.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <main style={{ minHeight: '100vh', background: '#fffaf0', color: '#29251f', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ background: '#713f12', color: 'white', padding: '30px 7%' }}>
        <p style={{ letterSpacing: 3 }}>TAMIL ORAL HISTORY ARCHIVE</p>
        <h1 style={{ fontSize: 38, margin: '8px 0' }}>தமிழ் தடம்</h1>
        <p>Preserving Tamil voices, memories and traditions.</p>
      </header>

      <section style={{ padding: '32px 7%' }}>
        <h2>Explore Districts | மாவட்டங்கள்</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {districts.map(d => (
            <span key={d} style={{ border: '1px solid #d6b98c', borderRadius: 20, padding: '9px 15px', background: 'white' }}>
              {d}
            </span>
          ))}
        </div>

        <h2 style={{ marginTop: 32 }}>Oral History Records | வாய்மொழி வரலாறு</h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or district..."
          style={{ width: '100%', maxWidth: 500, padding: 13, borderRadius: 8, border: '1px solid #c9b99d' }}
        />

        {loading ? (
          <p>Loading records...</p>
        ) : visibleStories.length === 0 ? (
          <p style={{ marginTop: 20 }}>No published records yet. Draft records will appear after they are reviewed and published.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginTop: 24 }}>
            {visibleStories.map(story => (
              <article key={story.id} style={{ background: 'white', padding: 22, borderRadius: 14, border: '1px solid #eadcc5' }}>
                <p style={{ color: '#92400e' }}>{story.districts?.name_ta ?? story.districts?.name_en}</p>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <small>Language: {story.language ?? 'Tamil'}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer style={{ background: '#29251f', color: 'white', padding: 22, textAlign: 'center' }}>
        தமிழ் தடம் · Digital Preservation of Tamil Oral History
      </footer>
    </main>
  )
}
