# தமிழ்த் தடம் (Tamil Thadam) — முழுமையான UI/UX வடிவமைப்பு விவரக்குறிப்பு & பொறியியல் ஒப்பந்தம்
**பதிப்பு:** 1.0.0 | **தேதி:** 2026 | **வடிவமைப்பு வகை:** பாரம்பரிய பனை ஓலை / கோவில் சுவரோவிய அழகியல் (Heritage Palm-Leaf Aesthetic)

---

## 📌 முகவுரை & பணி ஒதுக்கீடு (Hand-off Overview)

"தமிழ்த் தடம்" என்பது நம் தமிழ் மூத்த தலைமுறையினரின் (60+) நினைவுகளையும், அனுபவங்களையும் அவர்களின் சொந்தக் குரலில் பதிவு செய்து எதிர்காலத் தலைமுறைக்குப் பாதுகாக்கும் ஒரு முழுமையான வாய்மொழி வரலாற்றுக் காப்பகம் (Tamil Oral History Archive).

* **முக்கிய குறிக்கோள்:** தமிழ் மட்டுமே (Zero English in UI).
* **அழகியல் தத்துவம்:** நவீன சிலிக்கான் வேலி கார்ப்பரேட் பாணி அல்ல; பனை ஓலைச் சுவடிகள், கும்மட்டம், கோவில் கொடிமரம், குங்குமம், மஞ்சள், பொன் நிறம் மற்றும் வாழை இலை போன்ற தமிழ்ப் பாரம்பரிய கதகதப்பு.
* **பயனர் அணுகல்தன்மை (Accessibility):** முதியவர்களும் எளிதாக வாசிக்கக்கூடிய பெரிய எழுத்துக்கள் (17px+), அதிக வேறுபாடு (High Contrast), 44×44px தொடு பரப்புகள் (Touch targets), நிதானமான பக்கப் புரட்டல் இயக்கம்.

### 👥 பணிக் குழு ஒப்பந்தம் (Team Responsibilities Matrix)

| குழு உறுப்பினர் | பங்கு | முதன்மைப் பொறுப்புகள் |
| :--- | :--- | :--- |
| **ரிஹானா (Rihana)** | **Frontend Engineer (Next.js 16 / React 19)** | • Design Tokens (`globals.css`) அமைத்தல்<br>• அனைத்து பக்கங்களின் UI கூறுகள் (Components) உருவாக்குதல்<br>• StoryPlayer & Click-to-seek Transcript ஒருங்கிணைப்பு<br>• Audio Recording Web API & Live Timer கையாளுதல்<br>• முழுமையான மொபைல் மற்றும் அணுகல்தன்மை (A11y) உறுதிசெய்தல் |
| **டீனா (Teena)** | **Backend Engineer (Next.js API / Supabase / AI)** | • Supabase Database & Storage கட்டமைத்தல்<br>• Audio Upload & Processing Pipeline (`/api/record/*`)<br>• Sarvam ASR / Speechmatics ASR ஒருங்கிணைப்பு<br>• Gemini 3.8 Flash (`enrichStory`) சுருக்கம் மற்றும் குறிச்சொற்கள் உருவாக்கம்<br>• கதை வடிகட்டுதல் மற்றும் தேடல் API (`/api/stories`) |

---

## 1. வடிவமைப்பு அடையாளங்கள் — DESIGN TOKENS (CSS Variables)

கீழே உள்ள வண்ணங்கள், எழுத்துருக்கள் மற்றும் இடைவெளிகளை `src/app/globals.css` கோப்பில் துல்லியமாக இணைக்கவும்.

```css
/* ==========================================================================
   தமிழ்த் தடம் — DESIGN TOKENS (CSS Variables)
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap');

:root {
  /* --- முதன்மை வண்ணங்கள் (Core Color Palette) --- */
  --color-primary: #8B1E1E;         /* குங்குமச் சிவப்பு (Kumkum Red) */
  --color-primary-dark: #6B1414;    /* நிழல் சிவப்பு (Deep Shadow Red) */
  --color-accent: #D4A017;          /* மஞ்சள் பொன் (Turmeric Gold) */
  --color-accent-soft: #F5D98B;     /* மென்பொன் (Soft Gold) */
  --color-bg-palm: #FDF8EE;         /* பனை ஓலை வெண்மை (Palm Cream Base) */
  --color-bg-deep: #F7EDD8;         /* முதிர்ந்த ஓலை நிறம் (Deeper Cream) */
  --color-card-bg: #FFFDF7;         /* அட்டைப் பின்னணி (Pure Manuscript Cream) */
  --color-text-ink: #2B1810;        /* பனை மை / கருஞ்சிவப்பு கருப்பு (Dark Brown Ink) */
  --color-text-muted: #7A6A55;      /* மங்கிய மை (Muted Brown Text) */
  --color-border-brass: #D9C9A8;    /* பித்தளை / பழங்கால விளிம்பு (Antique Brass) */
  --color-success-leaf: #2D6A4F;    /* வாழை இலை பச்சை (Banana Leaf Green) */

  /* --- சரிபார்ப்பு நிலைகள் (Verification Status Tints) --- */
  --status-verified-bg: #DCF3E4;
  --status-verified-text: #2D6A4F;
  --status-unverified-bg: #EEE9DD;
  --status-unverified-text: #6B5B45;
  --status-review-bg: #FDF1D0;
  --status-review-text: #8A6300;

  /* --- எழுத்துரு (Typography) --- */
  --font-tamil: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-meta: 0.9375rem;/* 15px - குறிப்பு விவரங்கள் */
  --font-size-body: 1.0625rem;/* 17px - அடிப்படை வாசிப்பு உரை */
  --font-size-h3: 1.3125rem;  /* 21px - துணைத் தலைப்பு */
  --font-size-h2: 1.75rem;    /* 28px - பிரிவுத் தலைப்பு */
  --font-size-h1: 2.25rem;    /* 36px - முதன்மைத் தலைப்பு */
  --font-size-hero: 3.25rem;  /* 52px - முகப்புப் பெருந்தலைப்பு */

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75; /* முதியோர் வாசிப்பிற்கு உகந்தது */

  /* --- நிழல்கள் (Warm Traditional Stamp Shadows) --- */
  --shadow-card: 0 10px 30px -18px rgba(43, 24, 16, 0.25);
  --shadow-card-hover: 0 16px 36px -14px rgba(43, 24, 16, 0.32);
  --shadow-stamp: 0 4px 0px #6B1414, 0 8px 16px -4px rgba(139, 30, 30, 0.4);
  --shadow-stamp-active: 0 1px 0px #6B1414, 0 2px 4px rgba(139, 30, 30, 0.3);
  --shadow-gold-glow: 0 0 16px rgba(212, 160, 23, 0.35);

  /* --- எல்லைகள் & ஆரம் (Borders & Radius) --- */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-card: 14px;
  --radius-pill: 9999px;
  --border-manuscript-dash: 1px dashed #D9C9A8;

  /* --- இயக்கம் & வேகம் (Pacing & Curves) --- */
  --ease-page-turn: cubic-bezier(0.2, 0.7, 0.2, 1);
  --duration-fast: 150ms;
  --duration-medium: 250ms;
  --duration-slow: 400ms;
  --duration-hero: 800ms;
}

/* உலகளாவிய இயல்பிருப்பு (Global Reset & Manuscript Styling) */
body {
  background-color: var(--color-bg-palm);
  color: var(--color-text-ink);
  font-family: var(--font-tamil);
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(212, 160, 23, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(139, 30, 30, 0.04) 0%, transparent 40%);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
}

/* விசைப்பலகை வழிகாட்டி பார்வை (Focus Ring) */
:focus-visible {
  outline: 2.5px solid var(--color-accent) !important;
  outline-offset: 3px !important;
}
```

---

## 2. பக்க அமைப்புக் கட்டமைப்பு (Component Trees for All 7 Pages)

### உலகளாவிய கட்டமைப்பு (`src/app/layout.tsx`)
```text
RootLayout
├── SkipToContent ("உள்ளடக்கத்திற்கு செல்க")
├── Header (Sticky, 72px)
│   ├── BrandLogo ("தமிழ்த் தடம்") + Tagline ("வாய்மொழி வரலாற்றுக் காப்பகம்")
│   ├── DesktopNavMenu (முகப்பு, உலாவு, மாவட்டங்கள், எங்களைப் பற்றி)
│   ├── PrimaryCTAButton ("🎙 பதிவு செய்" -> /record)
│   └── MobileMenuButton (Hamburger icon, 48×48px)
├── MobileDrawer (Right-sliding on mobile)
├── KolamStrip (5px repeating temple kolam pattern)
├── MainContent (<main id="main-content">)
│   └── {Children: Page View}
├── OrnamentDivider (✦ ❋ ✦)
└── Footer
    ├── KolamStrip (Top of footer)
    ├── FooterContent ("© தமிழ்த் தடம் · 2026 · தமிழ் வாய்மொழி வரலாற்றை பாதுகாப்போம்")
    └── SubLinks ("விதிமுறைகள் · தனியுரிமை · உதவி")
```

---

### பக்கம் 1: முகப்பு (`/` — Home Page)
```text
HomePage
├── Section 1: AnimatedHero (68vh)
│   ├── ParallaxBackground (Darkened Tamil courtyard house, brightness 0.55)
│   ├── RadialWarmthOverlay (Gold/Red gradient blend)
│   ├── FloatingOrnaments (✦ ❋ ✺ ❁ - CSS float animations)
│   ├── EyebrowBadge ("தமிழ் வாய்மொழி காப்பகம்")
│   ├── StaggeredH1 ("பெரியவர்களின்" / "கதைகள்" / "— நம் மண்")
│   ├── Subtitle ("நம் தாத்தா பாட்டிகளின் குரலில்...")
│   ├── HeroActionGroup
│   │   ├── PrimaryCTAButton ("🎙 இப்போது பதிவு செய்யுங்கள்")
│   │   └── GlassOutlineButton ("கதைகளை உலாவுங்கள்")
│   ├── StatPillsRow
│   │   ├── StatPill ("6 கதைகள்")
│   │   └── StatPill ("6 மாவட்டங்கள்")
│   └── ScrollHint ("கீழே உருட்டுங்கள் ↓" with bouncing glyph)
│
├── OrnamentDivider (✦ ❋ ✦)
│
├── Section 2: PulamBar ("புலம் வாரியாக")
│   ├── SectionHeader ("புலம் வாரியாக")
│   └── PulamChipsRow (Horizontal scroll on mobile, flex wrap on desktop)
│       └── 8 × PulamChip (விவசாயம், பண்டிகை, சமையல், வரலாறு, நாட்டுப்புறம், வாழ்க்கை, சமயம், மருத்துவம்)
│
├── OrnamentDivider (✦ ❋ ✦)
│
├── Section 3: NewStoriesSection ("புதிய கதைகள்")
│   ├── SectionHeaderWithSearch
│   │   ├── SectionTitle ("புதிய கதைகள்")
│   │   └── QuickSearchInput ("🔍 தேடு — தலைப்பு, விளக்கம், குறிச்சொல்")
│   ├── StoryGrid (Auto-fill 320px, gap 1.25rem)
│   │   └── N × StoryCard (Title, tags, manuscript-quote, informant, verification badge)
│   └── ViewAllButton ("அனைத்து கதைகளையும் பார்க்க →")
│
├── OrnamentDivider (✦ ❋ ✦)
│
└── Section 4: DistrictsSection ("மாவட்டங்கள்")
    ├── SectionHeader ("மாவட்டங்கள்")
    ├── DistrictPillsRow (சென்னை, கோயம்புத்தூர், மதுரை, சேலம், தூத்துக்குடி, விழுப்புரம்)
    └── OutlineButton ("அனைத்து மாவட்டங்களும் →")
```

---

### பக்கம் 2: உலாவு (`/browse` — Browse Stories)
```text
BrowsePage
├── PageHeader
│   ├── H1 ("கதைகளை உலாவுங்கள்")
│   └── Subtitle ("தமிழ்நாட்டின் பல மாவட்டங்களிலிருந்து பதிவான அனுபவங்கள்")
├── FilterBar (Sticky under main header)
│   ├── SearchInputField (Grows dynamically)
│   ├── DistrictDropdown ("எல்லா மாவட்டங்களும்" + 6 மாவட்டங்கள்)
│   ├── PulamDropdown ("எல்லா புலங்களும்" + 8 புலங்கள்)
│   ├── VerificationDropdown ("எல்லா நிலைகளும்" + சரிபார்க்கப்பட்டது/சரிபார்ப்பில்/சரிபார்க்கப்படவில்லை)
│   └── SortDropdown ("புதியவை முதலில்" / "பழையவை முதலில்")
├── ActiveFiltersRow
│   ├── FilterChip ("📍 கோயம்புத்தூர்" + ×)
│   ├── FilterChip ("🏷 விவசாயம்" + ×)
│   └── ClearAllButton ("அனைத்தையும் நீக்கு")
├── ResultsCount ("12 கதைகள் கண்டறியப்பட்டன")
├── StoryGrid / EmptyStateView
│   └── N × StoryCard
└── PaginationBar
    ├── PrevButton ("முன்")
    ├── PageNumberChips [1, 2, 3]
    └── NextButton ("அடுத்து")
```

---

### பக்கம் 3: பதிவு செய் (`/record` — Record Story)
```text
RecordPage
├── RecordWizardContainer
│   ├── StageIndicator (1. பதிவு ➔ 2. முன்னோட்டம் ➔ 3. விவரங்கள் ➔ 4. செயலாக்கம்)
│   │
│   ├── Stage 1: ActiveRecordingCard
│   │   ├── InterviewPromptBox
│   │   │   ├── PromptCategoryBadge ("விவசாயம்")
│   │   │   ├── RotatingPromptQuestion ("உங்க சின்ன வயசுல நெல் நடவு எப்படி செய்வீங்க?")
│   │   │   └── NextPromptButton ("🔄 வேறு கேள்வி")
│   │   ├── BigRecordButton (Circular/Pill 84px - "🎙 இப்போது பதிவு செய்யுங்கள்")
│   │   ├── RecordingStatusRow (Hidden until record clicked)
│   │   │   ├── PulsingRedDot (🔴)
│   │   │   └── LiveTimer ("00:45 விநாடிகள்")
│   │   └── StopButton ("⏹ நிறுத்து")
│   │
│   ├── Stage 2: AudioPreviewCard
│   │   ├── AudioPlayerNativePreview
│   │   ├── DurationBadge ("ஒலி அளவு: 2:34 விநாடிகள்")
│   │   └── PreviewActionGroup
│   │       ├── ReRecordButton ("மீண்டும் பதிவு செய்" - outline)
│   │       └── ContinueButton ("தொடரவும் →" - primary)
│   │
│   ├── Stage 3: MetadataFormCard
│   │   ├── FormHeading ("கதை விவரங்களை உள்ளிடவும்")
│   │   ├── FormField: Title ("தலைப்பு *")
│   │   ├── FormRow (2 Columns)
│   │   │   ├── FormField: DistrictDropdown ("மாவட்டம் *")
│   │   │   └── FormField: PulamDropdown ("புலம் *")
│   │   ├── FormField: InformantName ("தகவலின் பெயர் / முதியவர் பெயர்", placeholder="அநாமதேயர்")
│   │   ├── FormField: SourceUrl ("ஆதார இணைப்பு (விருப்பம்)")
│   │   ├── ConsentCheckbox ("☑ இந்த பதிவை தமிழ்த் தடத்தில் வெளியிட முழு அனுமதி உள்ளது")
│   │   └── FormActionGroup
│   │       ├── PublishButton ("வெளியிடு" - primary stamp)
│   │       └── CancelButton ("ரத்து" - outline)
│   │
│   └── Stage 4: ProcessingModal / InlineView
│       ├── ProcessingStepper
│       │   ├── Step 1: ("✓ ஒலிப்பதிவு பதிவேற்றப்பட்டது")
│       │   ├── Step 2: ("⟳ எழுத்துப்பதிவு செயலாக்குகிறது... (Sarvam ASR)")
│       │   ├── Step 3: ("⟳ விளக்கம் உருவாக்குகிறது... (Gemini AI)")
│       │   ├── Step 4: ("⟳ தரவுத்தளத்தில் சேமிக்கிறது... (Supabase)")
│       │   └── Step 5: ("✓ வெற்றிகரமாக வெளியிடப்பட்டது!")
│       └── SuccessCTAButton ("கதையைக் காண்க →" -> /story/[id])
```

---

### பக்கம் 4: கதை விவரம் (`/story/[id]` — Story Detail with Sync Player)
```text
StoryDetailPage
├── BackNavigationLink ("← முகப்புக்குத் திரும்பு")
├── StoryHeaderCard
│   ├── StoryH1 (e.g., "1970களில் பொள்ளாச்சி சந்தை நினைவுகள்")
│   ├── StoryMetaRow
│   │   ├── DistrictChip ("📍 கோயம்புத்தூர்")
│   │   ├── PulamChip ("🏷 பண்டிகை")
│   │   ├── InformantChip ("👤 ராமசாமி (வயது 78)")
│   │   └── VerificationBadge ("✅ சரிபார்க்கப்பட்டது")
│   └── OrnamentDivider
├── SummaryBox (Gemini AI சுருக்கம் - 1.1rem italic, manuscript border)
│   ├── SummaryLabel ("கதைச் சுருக்கம் (AI உருவாக்கியது):")
│   └── SummaryParagraph (summary_ta)
│
├── StoryPlayerSection (Click-to-Seek Synchronized Player)
│   ├── PlaybackControlsRow
│   │   ├── BigPlayPauseButton ([▶ இயக்கு] / [⏸ நிறுத்து])
│   │   ├── TimeDisplay ("0:12 / 2:34")
│   │   └── InteractiveProgressBar (Click/drag to seek, gradient red-to-gold)
│   │
│   ├── SynchronizedTranscriptCard ("ஒலிவடிவ எழுத்துரை")
│   │   ├── TranscriptHelperText ("குறிப்பு: எந்த வரியையும் கிளிக் செய்து அந்த இடத்திலிருந்து கேட்கலாம்.")
│   │   └── SegmentsList
│   │       └── N × TranscriptSegmentRow
│   │           ├── TimestampButton ("0:15", muted 13px)
│   │           └── SegmentText ("அப்போதெல்லாம் காலையில ஐந்து மணிக்கே மாட்டு வண்டி கட்டிட்டு...")
│   │           /* Active Segment: Gold left border 4px + Warm gold bg + Bold text */
│   │
├── FullTranscriptAccordion ("முழு உரை வடிவம்")
│   └── FullTranscriptParagraphs
│
├── CulturalTagsSection ("கலாச்சாரக் குறிச்சொற்கள்")
│   └── TagsCloud (e.g., #பொள்ளாச்சி, #மாட்டுவண்டி, #பாரம்பரிய_விவசாயம்)
│
├── OrnamentDivider
│
└── RelatedStoriesSection ("தொடர்புடைய கதைகள் (கோயம்புத்தூர் மாவட்டம்)")
    └── 3 × StoryCard
```

---

### பக்கம் 5: அனைத்து மாவட்டங்கள் (`/districts` — All Districts)
```text
DistrictsPage
├── PageHeader
│   ├── H1 ("மாவட்டங்கள்")
│   └── Subtitle ("தமிழ்நாட்டின் பண்பாட்டுக் களங்கள் · 6 மாவட்டங்கள் · 18 கதைகள்")
├── OrnamentDivider
├── DistrictsGrid (2 columns desktop, 1 column mobile)
│   └── 6 × DistrictCard
│       ├── DistrictCardHeader ("📍 கோயம்புத்தூர்")
│       ├── StoryCountBadge ("6 கதைகள்")
│       ├── PulamBreakdownRow ("🌾 விவசாயம் · 3", "🪔 பண்டிகை · 2", "🍲 சமையல் · 1")
│       └── CardChevron ("ஆராய்க →")
```

---

### பக்கம் 6: மாவட்ட உட்பிரிவு (`/districts/[slug]` — District Drill-Down)
```text
DistrictDetailPage
├── BackNavigationLink ("← அனைத்து மாவட்டங்கள்")
├── DistrictHeroBanner
│   ├── DistrictH1 ("📍 கோயம்புத்தூர் மாவட்டம்")
│   ├── DistrictStoryCount ("மொத்தம் 6 கதைகள் சேமிக்கப்பட்டுள்ளன")
│   └── OrnamentDivider
├── PulamFilterButtonGroup
│   ├── AllPulamButton ("அனைத்தும் (6)")
│   ├── PulamFilterButton ("🌾 விவசாயம் (3)")
│   ├── PulamFilterButton ("🪔 பண்டிகை (2)")
│   └── PulamFilterButton ("🍲 சமையல் (1)")
├── OrnamentDivider
├── DistrictStoryGrid
│   └── N × StoryCard
└── EmptyStateView (கதைகள் இல்லாத போது: "இம்மாவட்டத்தில் இன்னும் கதைகள் பதிவாகவில்லை.")
```

---

### பக்கம் 7: எங்களைப் பற்றி (`/about` — About Archive)
```text
AboutPage
├── H1 ("எங்களைப் பற்றி — தமிழ்த் தடம்")
├── Subtitle ("வாய்மொழி மரபைப் பாதுகாக்கும் மக்கள் காப்பகம்")
├── OrnamentDivider
├── NarrativeSection ("ஏன் இந்த காப்பகம்?")
│   └── ManuscriptQuote ("எழுத்துகளில் வராத எத்தனையோ உண்மைகளும் வாழ்க்கைப் பாடங்களும் நம் பெரியவர்களின் பேச்சில் மட்டுமே வாழ்கின்றன...")
├── PillarsGrid (3 Cards: குரல் பதிவு, செயற்கை நுண்ணறிவு பகுப்பாய்வு, திறந்த ஆவணக் காப்பகம்)
├── TechnologyStackSection ("பயன்படுத்தப்படும் தொழில்நுட்பங்கள்")
│   └── TechPills (Sarvam AI தமிழ் ASR, Google Gemini 3.8 Flash, Supabase, Next.js)
└── JoinCTA ("உங்கள் குடும்பத்துப் பெரியவர்களின் குரலையும் ஆவணப்படுத்துங்கள்")
```

---

## 3. மறுபயன்பாட்டு கூறுகள் விவரக்குறிப்பு (Component Specs)

### 3.1. `KolamStrip` (கோலப் பட்டை)
* **நோக்கம்:** தலைப்பு, பிரிவுகள் மற்றும் அடிக்குறிப்பின் மேல் ஓடும் பாரம்பரிய கோவில் கோல பார்டர்.
* **அளவு:** உயரம் `6px` அல்லது `8px`, அகலம் `100%`.
* **CSS Implementation:**
  ```css
  .kolam-strip {
    height: 6px;
    width: 100%;
    background: repeating-linear-gradient(
      90deg,
      #8B1E1E 0px, #8B1E1E 16px,
      #D4A017 16px, #D4A017 32px,
      #2D6A4F 32px, #2D6A4F 48px,
      #FDF8EE 48px, #FDF8EE 64px
    );
    border-bottom: 1px solid rgba(139, 30, 30, 0.2);
  }
  ```
* **பயன்பாடு:** Header கீழே, Hero மேலே, Footer மேலே.

---

### 3.2. `OrnamentDivider` (ஏடு பிரிப்பான்)
* **நோக்கம்:** இரண்டு பிரிவுகளுக்கு இடையில் பனை ஓலைச் சுவடிப் பாணியில் வரும் `✦ ❋ ✦` குறியீடு.
* **Props:** `variant?: 'standard' | 'compact'`.
* **அமைப்பு:**
  ```html
  <div class="ornament-divider" role="separator" aria-hidden="true">
    <span class="ornament-line"></span>
    <span class="ornament-symbols">✦ ❋ ✦</span>
    <span class="ornament-line"></span>
  </div>
  ```
* **வடிவமைப்பு:** மெல்லிய கோடுகள் (`#D9C9A8`), குறியீடுகள் மஞ்சள் பொன் (`#D4A017`) மற்றும் குங்குமச் சிவப்பு (`#8B1E1E`).

---

### 3.3. `Button` (முத்திரை பொத்தான் — Stamp Button)
* **நோக்கம்:** தமிழ் முத்திரையைப் போன்று அழுத்தக் கூடிய தனித்துவமான பொத்தான்.
* **மாறுபாடுகள் (Variants):**
  1. `primary`: பின்னணி `#8B1E1E`, உரை வெள்ளை, கீழ் நிழல் `0 4px 0 #6B1414`.
  2. `outline`: பின்னணி வெளிப்படை, பார்டர் `1.5px solid #8B1E1E`, உரை `#8B1E1E`.
  3. `accent`: பின்னணி `#D4A017`, உரை `#2B1810`, கீழ் நிழல் `0 4px 0 #9E7409`.
* **நிலைகள் (States):**
  - **Hover:** `transform: translateY(-1px); box-shadow: 0 6px 0 var(--color-primary-dark);`
  - **Active:** `transform: translateY(2px); box-shadow: 0 1px 0 var(--color-primary-dark);` (முத்திரை பதிப்பது போன்ற உணர்வு).
  - **Disabled:** சாம்பல் நிறம் (`#D9C9A8`), அமுங்காது, `cursor: not-allowed`.
  - **Focus-visible:** `outline: 2.5px solid #D4A017; outline-offset: 3px`.
* **குறைந்தபட்ச அளவு:** `min-height: 44px` (மொபைலில் `48px`).

---

### 3.4. `StoryCard` (கதை அட்டை)
* **Props இடைமுகம்:**
  ```typescript
  interface StoryCardProps {
    id: string;
    title: string;
    district_name_ta: string;
    pulam_name_ta: string;
    pulam_emoji: string;
    informant_name: string;
    informant_age?: number;
    summary_excerpt: string;
    verification_status: 'verified' | 'unverified' | 'in_review';
    duration_seconds: number;
    audio_url: string;
  }
  ```
* **காட்சி அமைவு (Manuscript Layout):**
  - பின்னணி: `#FFFDF7`, ஆரம் `14px`, பார்டர் `1px solid #D9C9A8`.
  - **உள் விளிம்பு (Dashed Inner Border):** விளிம்பிலிருந்து `7px` உள்நோக்கி `border: 1px dashed rgba(217, 201, 168, 0.7)` சுவடி விளிம்பு போன்ற தோற்றம்.
  - உரை நடை:
    - தலைப்பு (H3): `#8B1E1E`, கிளிக் செய்தால் `/story/[id]` செல்லும்.
    - தகவல்கள்: `📍 கோயம்புத்தூர்` மற்றும் `🌾 விவசாயம்` சிறிய குங்கும/பொன் சில்லுகள்.
    - சுருக்க மேற்கோள் (Excerpt): சாய்வு எழுத்து (Italic), இடதுபுறம் `3px solid #D4A017` பொன் கோடுடன் 2 வரிகள் மட்டும் (`line-clamp-2`).
    - அடிக்குறிப்பு: இடதுபுறம் `👤 ராமசாமி (வயது 78)`, வலதுபுறம் சரிபார்ப்பு பேட்ஜ்.
* **Hover நிலை:** `transform: translateY(-2px); box-shadow: var(--shadow-card-hover)`.

---

### 3.5. `StatusBadge` (சரிபார்ப்பு பேட்ஜ்)
* **மதிப்புகள் & வண்ணங்கள்:**
  1. `verified` (சரிபார்க்கப்பட்டது):
     - ஐகான்: `✅` | பின்னணி: `#DCF3E4` | உரை: `#2D6A4F` | பார்டர்: `1px solid #B8E4C4`
  2. `unverified` (சரிபார்க்கப்படவில்லை):
     - ஐகான்: `⚪` | பின்னணி: `#EEE9DD` | உரை: `#6B5B45` | பார்டர்: `1px solid #D9C9A8`
  3. `in_review` (சரிபார்ப்பில் உள்ளது):
     - ஐகான்: `🕓` | பின்னணி: `#FDF1D0` | உரை: `#8A6300` | பார்டர்: `1px solid #F5D98B`
* **அணுகல்தன்மை:** நிறக்குருடு உள்ளவர்களுக்காக ஐகான் + தெளிவான தமிழ் சொல் இரண்டும் எப்போதும் இருக்கும்.

---

### 3.6. `StoryPlayer` (ஒத்திசைவு ஒலி இயக்கி — Click-to-Seek Player)
* **Props இடைமுகம்:**
  ```typescript
  interface StoryPlayerProps {
    audioUrl: string;
    durationSeconds: number;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  }
  ```
* **கூறுகள் & இயக்க முறைமை:**
  1. **முதன்மை இயக்கு பொத்தான்:** பெரிய வட்ட/செவ்வக வடிவம் (`60×60px`).
     - இயங்காத நிலை: `▶ இயக்கு`
     - இயங்கும் நிலை: `⏸ நிறுத்து`
  2. **நேரக் காட்சி:** `0:12 / 2:34` (தெளிவான தமிழ் எழுத்துரு எண்கள்).
  3. **முன்னேற்றப் பட்டை (Progress Bar):**
     - பின்னணி: `#F7EDD8`, நிரப்பும் வண்ணம்: சிவப்பு முதல் தங்கம் வரை கிரேடியன்ட் (`linear-gradient(90deg, #8B1E1E, #D4A017)`).
     - கிளிக் அல்லது இழுத்தால் (Scrub) ஆடியோ அந்த நேரத்திற்கு மாறும் (`audio.currentTime = newTime`).
  4. **ஒத்திசைக்கப்பட்ட வரிகள் பட்டியல் (Synchronized Transcript Segments):**
     - ஒவ்வொரு வரியும் ஒரு தனித்த பொத்தான் (`role="button"`, `tabindex="0"`).
     - இடதுபுறம்: நேரம் (`0:15` - மங்கிய உரை `#7A6A55`).
     - வலதுபுறம்: தமிழ் உரை (`Noto Sans Tamil`, 17px).
     - **செயலில் உள்ள நிலை (Active Segment):**
       - ஆடியோ இயங்கும் போது `currentTime >= segment.start && currentTime < segment.end` எனில்:
       - இடதுபுற விளிம்பு: `4px solid #D4A017`.
       - பின்னணி: மென்பொன் நிறம் (`#FDF1D0`).
       - உரை: தடிமன் (`font-weight: 600; color: #2B1810`).
       - தானியங்கு உருளல்: `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.
     - **Hover நிலை:** லேசான பொன் நிழல் (`#FAF3E0`).
     - **கிளிக் நிகழ்வு:** வரியை க்ளிக் செய்தவுடன் ஆடியோவின் நேரம் `audio.currentTime = segment.start` என மாறி, தானாக ஒலிக்கத் தொடங்கும்.

---

### 3.7. `AudioRecorder` (ஒலிப்பதிவு கருவி)
* **Props & State:**
  ```typescript
  interface AudioRecorderState {
    status: 'idle' | 'recording' | 'paused' | 'stopped';
    duration: number; // விநாடிகள்
    audioBlob: Blob | null;
    audioUrl: string | null;
    currentPromptIndex: number;
  }
  ```
* **கூறுகள்:**
  1. **கேள்விப் பெட்டி (Interview Prompt Card):**
     - 30 பாரம்பரிய கேள்விகளில் இருந்து தேர்ந்தெடுக்கப்பட்ட ஒன்று.
     - "🔄 வேறு கேள்வி மாற்று" பொத்தான்.
  2. **பதிவு பொத்தான்:**
     - இயல்பு நிலை: பெரிய வட்ட பொத்தான் `[🎙 இப்போது பதிவு செய்யுங்கள்]` (குங்குமச் சிவப்பு, 84px).
     - பதிவாகும்போது: `[⏹ நிறுத்து]` (சிவப்பு விளிம்பு, வெள்ளை பின்னணி).
  3. **நேரடி கவுண்டர் (Live Counter):**
     - `🔴 பதிவு செய்யப்படுகிறது... 00:45 விநாடிகள்`.
     - சிவப்பு புள்ளி மெதுவாக ஒளிரும் (Pulse animation: 1.2s).
  4. **அலைவரிசை காட்சி (Waveform Visualizer):** Web Audio API AnalyserNode மூலம் பயனர் பேசும் போது மெல்லிய தங்க நிற அலைகள் உயர்ந்து தாழும்.

---

### 3.8. `ProcessingModal` (செயலாக்கக் காட்சி)
* **5-படி முன்னேற்ற நிலைகள் (Progress Stepper):**
  1. `✓ ஒலிப்பதிவு பதிவேற்றப்பட்டது`
  2. `⟳ எழுத்துப்பதிவு செயலாக்குகிறது... (Sarvam ASR)`
  3. `⟳ விளக்கம் உருவாக்குகிறது... (Gemini AI)`
  4. `⟳ தரவுத்தளத்தில் சேமிக்கிறது... (Supabase)`
  5. `✓ வெற்றிகரமாக வெளியிடப்பட்டது!`
* **காட்சி முறை:** செயலில் உள்ள படியில் தங்க வளைய சுழலி (Gold rotating ring spinner), முடிந்த படிகளில் வாழை இலை பச்சை டிக் (`✓`).

---

## 4. தரவு மாதிரிகள் & பின்தள ஒப்பந்தம் (Data Models & Backend Contracts)

### 4.1. Supabase Database Schema (`stories` அட்டவணை)
டீனா (Backend) கட்டமைக்க வேண்டிய தரவுத்தளம்:

```sql
CREATE TYPE verification_status_enum AS ENUM ('verified', 'unverified', 'in_review');

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  district_slug TEXT NOT NULL,
  district_name_ta TEXT NOT NULL,
  pulam_slug TEXT NOT NULL,
  pulam_name_ta TEXT NOT NULL,
  informant_name TEXT DEFAULT 'அநாமதேயர்',
  informant_age INTEGER,
  source_url TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  verification_status verification_status_enum NOT NULL DEFAULT 'unverified',
  summary_ta TEXT,
  transcript_full TEXT,
  transcript_segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  entities JSONB DEFAULT '{"people":[], "places":[], "traditions":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- தேடல் மற்றும் வடிகட்டலுக்கான குறியீடுகள் (Indexes)
CREATE INDEX idx_stories_district ON stories(district_slug);
CREATE INDEX idx_stories_pulam ON stories(pulam_slug);
CREATE INDEX idx_stories_status ON stories(verification_status);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
```

---

### 4.2. புலங்கள் (Domains / Pulam) வரையறை
| Slug | தமிழ் பெயர் | Emoji | விளக்கம் |
| :--- | :--- | :---: | :--- |
| `farming` | விவசாயம் | 🌾 | உழவு, நடவு, விதைகள், மழை, விளைச்சல் |
| `festival` | பண்டிகை | 🪔 | பொங்கல், தீபாவளி, கோவில் திருவிழாக்கள் |
| `cooking` | சமையல் | 🍲 | பாரம்பரிய உணவு முறைகள், கைமணங்கள் |
| `history` | வரலாறு | 📜 | ஊர் பெயர்க் காரணம், சுதந்திரப் போராட்ட நினைவுகள் |
| `folklore` | நாட்டுப்புறம் | 🎵 | நாட்டுப்புறப் பாடல்கள், தாலாட்டு, கதைகள் |
| `life` | வாழ்க்கை | 🌱 | பழங்கால வாழ்வியல் முறை, கூட்டுக் குடும்பம் |
| `religion` | சமயம் | 🛕 | கோவில் சிற்பங்கள், வழிபாட்டு முறைகள் |
| `medicine` | மருத்துவம் | 🌿 | பாட்டி வைத்தியம், மூலிகைகள், நாட்டு மருத்துவம் |

---

### 4.3. மாவட்டங்கள் (Districts) வரையறை
| Slug | மாவட்டம் (Tamil) | இயல்புநிலை நிலை |
| :--- | :--- | :--- |
| `chennai` | சென்னை | செயலில் உள்ளது |
| `coimbatore` | கோயம்புத்தூர் | செயலில் உள்ளது |
| `madurai` | மதுரை | செயலில் உள்ளது |
| `salem` | சேலம் | செயலில் உள்ளது |
| `thoothukudi` | தூத்துக்குடி | செயலில் உள்ளது |
| `villupuram` | விழுப்புரம் | செயலில் உள்ளது |

---

### 4.4. பின்தள API ஒப்பந்தங்கள் (API Endpoints for Teena & Rihana)

#### 1. `POST /api/record/upload`
* **விளக்கம்:** பதிவு செய்யப்பட்ட ஆடியோவை தற்காலிகமாக அல்லது Supabase Storage bucket-ல் ஏற்றும்.
* **Request:** `multipart/form-data` (file: `audio.webm` / `audio.mp3`).
* **Response (Success):**
  ```json
  {
    "success": true,
    "audioUrl": "https://xyz.supabase.co/storage/v1/object/public/audios/rec_123.mp3",
    "durationSeconds": 154
  }
  ```

#### 2. `POST /api/record/process`
* **விளக்கம்:** Sarvam ASR மூலம் டிரான்ஸ்கிரிப்ஷன் மற்றும் Gemini 3.8 Flash மூலம் சுருக்கம் எடுத்து Supabase-ல் சேமிக்கும்.
* **Request Body:**
  ```json
  {
    "audioUrl": "https://xyz.supabase.co/storage/v1/object/public/audios/rec_123.mp3",
    "durationSeconds": 154,
    "title": "பழைய பொங்கல் கொண்டாட்டங்கள்",
    "districtSlug": "coimbatore",
    "pulamSlug": "festival",
    "informantName": "மாரியம்மாள்",
    "informantAge": 76,
    "sourceUrl": "",
    "consentGiven": true
  }
  ```
* **Response (Success):**
  ```json
  {
    "success": true,
    "storyId": "8b51d8d2-43bb-4034-8c08-e8cb042296d9",
    "summary_ta": "முந்தைய காலங்களில் பொங்கல் பண்டிகையின் போது வீடுகளில் பானை வைத்து கொண்டாடிய அனுபவங்களை மாரியம்மாள் விவரிக்கிறார்.",
    "tags": ["பொங்கல்", "பாரம்பரியம்", "மண்பானை"],
    "redirectUrl": "/story/8b51d8d2-43bb-4034-8c08-e8cb042296d9"
  }
  ```

#### 3. `GET /api/stories`
* **விளக்கம்:** கதைகளின் பட்டியல் மற்றும் தேடல்.
* **Query Params:**
  - `q`: தேடல் சொல் (தலைப்பு, சுருக்கம், குறிச்சொல்)
  - `district`: மாவட்ட slug
  - `pulam`: புலம் slug
  - `status`: `verified` | `unverified` | `in_review`
  - `sort`: `newest` | `oldest`
  - `page`: எண் (இயல்பு: 1)
  - `limit`: எண் (இயல்பு: 9)

---

## 5. பயனர் தொடர்புப் பாதைகள் (Step-by-Step Interaction Flows)

### ஓட்டம் 1: புதிய கதை பதிவு செய்தல் (Record New Story Flow)
```text
[பயனர் '/record' பக்கத்திற்கு வருகிறார்]
                      │
                      ▼
[படி 1: கேள்வி தேர்வு & பதிவு தொடங்குதல்]
- திரையில் தோன்றும் கேள்வியை வாசிக்கிறார் (எ.கா: "உங்க ஊரு பேர் எப்படி வந்துச்சு?")
- விருப்பப்பட்டால் "🔄 வேறு கேள்வி" அழுத்துகிறார்.
- பெரிய சிவப்புக் குமிழ் [🎙 இப்போது பதிவு செய்யுங்கள்] அழுத்துகிறார்.
- உலாவி ஒலிவாங்கி அனுமதி (Microphone Permission) கேட்கிறது -> பயனர் "Allow" செய்கிறார்.
                      │
                      ▼
[படி 2: நேரடிப் பதிவு (Live Recording)]
- குமிழ் [⏹ நிறுத்து] என மாறுகிறது.
- சிவப்பு புள்ளி 🔴 ஒளிர்கிறது. நேரக் கவுண்டர் (00:01, 00:02...) ஓடுகிறது.
- முதியவர் பேசி முடித்ததும் [⏹ நிறுத்து] பொத்தானை அழுத்துகிறார்.
                      │
                      ▼
[படி 3: ஒலி முன்னோட்டம் (Audio Preview)]
- பதிவு செய்யப்பட்ட ஒலி இயக்கி தோன்றுகிறது. பயனர் கேட்டுப் பார்க்கலாம்.
- திருப்தி இல்லை எனில்: [மீண்டும் பதிவு செய்] -> படி 1-க்குத் திரும்பும்.
- திருப்தி எனில்: [தொடரவும் →] அழுத்துகிறார்.
                      │
                      ▼
[படி 4: கதை விவரங்கள் படிவம் (Metadata Entry)]
- தலைப்பு உள்ளிடுகிறார் (எ.கா: "எங்கள் கிராமத்து மாட்டுப் பொங்கல்").
- மாவட்டம் (Dropdown: கோயம்புத்தூர்) & புலம் (Dropdown: பண்டிகை) தேர்ந்தெடுக்கிறார்.
- முதியவரின் பெயர் (எ.கா: "சுப்பையா தாத்தா") உள்ளிடுகிறார்.
- அனுமதி பெட்டியைத் தேர்ந்தெடுக்கிறார் (☑).
- [வெளியிடு] பொத்தானை அழுத்துகிறார்.
                      │
                      ▼
[படி 5: AI செயலாக்கம் (Processing Stepper)]
- திரை தானாக 5-படி முன்னேற்றத்தைக் காட்டுகிறது:
  1. ஒலிப்பதிவு சேமிப்பு... (முடிந்தது ✓)
  2. Sarvam ASR எழுத்து வடிவம்... (முடிந்தது ✓)
  3. Gemini AI தமிழ் சுருக்கம் & குறிச்சொற்கள்... (முடிந்தது ✓)
  4. தரவுத்தளத்தில் காப்பகப்படுத்தல்... (முடிந்தது ✓)
- "வெற்றிகரமாக வெளியிடப்பட்டது!" வாழ்த்துச் செய்தி.
                      │
                      ▼
[படி 6: கதைப் பக்கத்திற்குத் தானாகச் செல்லுதல்]
- பயனர் புதிய கதைப் பக்கத்திற்கு (`/story/[id]`) நகர்த்தப்படுகிறார்.
```

---

### ஓட்டம் 2: உலாவுதல் & வடிகட்டுதல் (Browse & Filter Flow)
```text
[பயனர் '/browse' அல்லது முகப்பில் புலம் சில்லுவை அழுத்துகிறார்]
                      │
                      ▼
[வடிகட்டிப் பட்டை (Sticky Filter Bar)]
- பயனர் "விவசாயம்" புலத்தைத் தேர்ந்தெடுக்கிறார்.
- மாவட்டம் "மதுரை" எனத் தேர்ந்தெடுக்கிறார்.
- URL உடனுக்குடன் மாறுகிறது: `/browse?pulam=farming&district=madurai`
                      │
                      ▼
[தேர்வு சில்லுகள் (Active Filter Chips)]
- பட்டையின் கீழ் சில்லுகள் தோன்றுகின்றன:
  [🌾 விவசாயம் ×]  [📍 மதுரை ×]  [அனைத்தையும் நீக்கு]
- பயனர் ஏதேனும் ஒரு '×' குறியை அழுத்தினால் அந்த வடிகட்டி உடனே நீங்கும்.
                      │
                      ▼
[முடிவுகள் பட்டியல் (Results Grid)]
- பொருந்தும் கதைகள் உடனடியாகக் காட்டப்படுகின்றன (Skeleton loading -> Story cards).
- முடிவுகள் இல்லையெனில்:
  "கதைகள் எதுவும் கிடைக்கவில்லை. வடிகட்டிகளை மாற்றி முயற்சிக்கவும்."
```

---

### ஓட்டம் 3: ஒத்திசைவு ஒலி இயக்கம் (Click-to-Seek Playback Flow)
```text
[பயனர் கதை விவரப் பக்கத்தில் (`/story/[id]`) இருக்கிறார்]
                      │
                      ▼
[விருப்பம் A: நேரடி இயக்கம்]
- பயனர் [▶ இயக்கு] பொத்தானை அழுத்துகிறார்.
- ஆடியோ ஒலிக்கத் தொடங்குகிறது.
- ஆடியோவின் நேரத்திற்கு ஏற்ப (Current Time), வலதுபுறமுள்ள எழுத்துரையின் தொடர்புடைய வரி
  தங்க நிற பார்டர் மற்றும் தடிமனான எழுத்துடன் ஹைலைட் ஆகிறது.
- பக்க உருளல் தானாக நடக்கும் (Auto-scroll follows active text).
                      │
                      ▼
[விருப்பம் B: குறிப்பிட்ட வரியைக் கேட்டு அறிதல் (Click-to-Seek)]
- பயனர் கீழே உள்ள உரையில் "01:24" என்ற நேரத்திலுள்ள வரியைப் படிக்கிறார்.
- அந்த குறிப்பிட்ட வரியின் மீது கிளிக் செய்கிறார்.
- ஆடியோ உடனடியாக 1 நிமிடம் 24-வது விநாடிக்குத் தாவுகிறது (`audio.currentTime = 84`).
- ஆடியோ தானாக தொடர்ந்து ஒலிக்கிறது.
```

---

## 6. அசைவூட்ட விவரக்குறிப்பு (Animation & Motion Specification)

தமிழ்த் தடத்தின் அசைவூட்டம் மென்மையான பக்கப் புரட்டல் போலவும், நிதானமான வரலாற்றுப் பதிவு போலவும் இருக்க வேண்டும். சிலிக்கான் வேலி பவுன்சி ஜம்ப்கள் தவிர்க்கப்பட வேண்டும்.

* **அடிப்படை வளைவு (Master Easing):** `cubic-bezier(0.2, 0.7, 0.2, 1)`

### 6.1. முகப்புத் திரை அரங்கேற்ற காலவரிசை (Hero Reveal Sequence)
| நேரம் (விநாடி) | உறுப்பு (Element) | இயக்கம் (Motion Details) |
| :---: | :--- | :--- |
| **0.00s** | பாரம்பரிய வீட்டின் பின்னணி | Fade in (0 → 1), Scale down (1.06 → 1.00), 1200ms |
| **0.15s** | "தமிழ் வாய்மொழி காப்பகம்" பேட்ஜ் | Fade up 15px, 600ms |
| **0.35s** | பெருந்தலைப்பு வரி 1: "பெரியவர்களின்" | Fade up 40px, 700ms |
| **0.50s** | பெருந்தலைப்பு வரி 2: "கதைகள்" | Fade up 40px, 700ms |
| **0.65s** | பெருந்தலைப்பு வரி 3: "— நம் மண்" | Fade up 40px, 700ms |
| **0.85s** | விளக்க உரை (Subtitle) | Fade up 25px, 700ms |
| **1.05s** | பொத்தான்கள் குழு ([பதிவு செய்] / [உலாவு]) | Fade up 20px, 600ms |
| **1.25s** | புள்ளிவிவரக் குமிழ்கள் (Stat pills) | Fade up 15px, 500ms |
| **1.60s** | "கீழே உருட்டுங்கள் ↓" குறிப்பு | Fade in 800ms, தொடர்ந்து மெதுவாக துடிக்கும் (Bounce 6px) |

---

### 6.2. நுண்ணிய இயக்கங்கள் (Micro-Interactions)
1. **முத்திரை பொத்தான் அழுத்தம் (Stamp Button Click):**
   - Active: `transform: translateY(2px); box-shadow: 0 1px 0 #6B1414; transition: 60ms;`
2. **அட்டை மிதப்பு (Card Hover):**
   - Hover: `transform: translateY(-2px); box-shadow: var(--shadow-card-hover); transition: 180ms ease;`
3. **எழுத்துரை வரி ஹைலைட் (Transcript Segment Highlight):**
   - Active: `border-left: 4px solid #D4A017; background-color: #FDF1D0; transition: background 200ms ease, border 150ms ease;`
4. **சுழலும் சுழலி (Loading Ring Spinner):**
   - தங்கம் மற்றும் சிவப்பு வளையம்: `animation: spin 1000ms linear infinite;`
5. **இயக்கக் குறைப்பு (Reduced Motion):**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

## 7. முதியோர் & மாற்றுத்திறனாளர் அணுகல்தன்மை (Accessibility / A11y Checklist)

முதியவர்கள் மற்றும் கண்பார்வை குறைபாடு உடையவர்களுக்கான மிக முக்கியமான விதிமுறைகள்:

- [x] **வண்ண வேறுபாடு (WCAG 2.1 AA):**
  - பனை ஓலை பின்னணியில் (`#FDF8EE`) மை உரை (`#2B1810`): **13.2:1** (மிகச் சிறந்தது — தேவை 4.5:1).
  - குங்குமச் சிவப்பு பொத்தானில் (`#8B1E1E`) வெள்ளை உரை: **7.1:1** (தேர்ச்சி).
  - மங்கிய உரை (`#7A6A55`): **4.6:1** (தேர்ச்சி).
- [x] **எழுத்து அளவு & இடைவெளி:**
  - உடல் உரை (Body text) எப்போதும் குறைந்தது **17px**.
  - வரி இடைவெளி (Line-height) குறைந்தது **1.75**. எழுத்துக்கள் நெரிசலாக இருக்கக் கூடாது.
- [x] **தொடு பரப்பளவு (Touch Targets):**
  - அனைத்து பொத்தான்கள், சில்லுகள், இணைப்புகள் குறைந்தது **44×44px** பரப்பளவு கொண்டவை (மொபைலில் பொத்தான்கள் **48px** உயரம்).
- [x] **விசைப்பலகை கட்டுப்பாடு (Keyboard Navigation):**
  - ஒலி இயக்கிக்கு விசைப்பலகை குறுக்குவழிகள்:
    - `Spacebar`: ஒலி இயக்கு / நிறுத்து.
    - `Left Arrow (←)`: 5 விநாடிகள் பின்னோக்கிச் செல்.
    - `Right Arrow (→)`: 5 விநாடிகள் முன்னோக்கிச் செல்.
    - `Home`: தொடக்கத்திற்குச் செல்.
    - `End`: முடிவிற்குச் செல்.
- [x] **திரை வாசகர் ஆதரவு (Screen Readers in Tamil):**
  - ஐகான் மட்டுமே உள்ள பொத்தான்களுக்கு தெளிவான தமிழ் `aria-label` இருக்க வேண்டும் (எ.கா: `aria-label="ஒலி இயக்கத்தைத் தொடங்கு"`).
  - நேரடி கவுண்டருக்கு `aria-live="polite"` மற்றும் `aria-atomic="true"`.
- [x] **நிறக்குருடு பாதுகாப்பு:**
  - நிலைக் குறிகாட்டிகளில் நிறத்துடன் சேர்த்து ஐகான்கள் (`✅`, `⚪`, `🕓`) மற்றும் தமிழ் வார்த்தைகள் கட்டாயம்.

---

## 8. நிலைமைகள்: ஏற்றம், வெறுமை மற்றும் பிழைகள் (Loading, Empty & Error States)

### 8.1. ஏற்றப்படும் நிலைகள் (Loading States)
* **கதைகள் கட்டம் (Story Grid):**
  - 3 முதல் 6 சாம்பல்-பொன் நிற எலும்புக்கூடு அட்டைகள் (Skeleton Cards) மெல்லிய பளபளப்புடன் (Shimmer).
  - உரை: `"கதைகள் சேகரிக்கப்படுகின்றன..."`
* **ஒலி இயக்கி (Story Player):**
  - `"ஒலி வடிவம் தயாராகிறது..."` (தங்க வளைய சுழலி).

---

### 8.2. வெறுமை நிலைகள் (Empty States)
* **உலாவு பக்கத்தில் முடிவுகள் இல்லாத போது:**
  ```text
  ┌─────────────────────────────────────────────────────────────┐
  │                           📜                                │
  │              கதைகள் எதுவும் கிடைக்கவில்லை                    │
  │     நீங்கள் தேர்ந்தெடுத்த வடிகட்டிகளுக்கு கதைகள் இல்லை.       │
  │               வடிகட்டிகளை மாற்றி முயற்சிக்கவும்.             │
  │                                                             │
  │             [அனைத்து வடிகட்டிகளையும் நீக்கு]                 │
  └─────────────────────────────────────────────────────────────┘
  ```
* **மாவட்டத்தில் கதைகள் இல்லாத போது:**
  - `"இம்மாவட்டத்தில் இன்னும் கதைகள் பதிவாகவில்லை. உங்கள் ஊரின் முதல் கதையை நீங்களே பதிவு செய்யுங்கள்!"`
  - பொத்தான்: `[🎙 இப்போது பதிவு செய்யுங்கள்]`

---

### 8.3. பிழை நிலைகள் (Error States)
* **ஒலிவாங்கி அனுமதி மறுக்கப்பட்டால்:**
  - செய்தி: `"🔴 ஒலிவாங்கி அனுமதி மறுக்கப்பட்டது. உங்கள் உலாவியின் அமைப்புகளில் (Browser Settings) ஒலிவாங்கியை அனுமதித்து மீண்டும் முயற்சிக்கவும்."`
* **ஆடியோ பதிவேற்றப் பிழை:**
  - செய்தி: `"ஒலிப்பதிவை சேமிப்பதில் பிழை ஏற்பட்டது. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."`
  - பொத்தான்: `[மீண்டும் முயற்சி செய்]`
* **AI எழுத்துப்பதிவு / சுருக்கம் தாமதமானால்:**
  - செய்தி: `"எழுத்துப்பதிவு சிறிது கூடுதல் நேரம் எடுக்கிறது. கவலைப்பட வேண்டாம், உங்கள் ஒலிப்பதிவு பாதுகாப்பாக உள்ளது."`

---

## 9. மொபைல் திரை வடிவமைப்பு & முறிவுப் புள்ளிகள் (Responsive Specs & Text Wireframes)

### திரை முறிவுப் புள்ளிகள் (Breakpoints)
* **Mobile:** `< 640px` (முழு அகல பொத்தான்கள், ஒற்றை நெடுவரிசை கதைகள்)
* **Tablet:** `640px – 1024px` (இரண்டு நெடுவரிசை கட்டமைப்பு)
* **Desktop:** `> 1024px` (அதிகபட்ச அகலம் `1080px`, மையப்படுத்தப்பட்டது, 3 நெடுவரிசை கட்டமைப்பு)

---

### மொபைல் முகப்பு வரிவடிவம் (Mobile Home Wireframe)
```text
+------------------------------------------+
| [LOGO: தமிழ்த் தடம்]            [☰ மெனு]   |
| [கோலப் பட்டை: =========================] |
+------------------------------------------+
|                                          |
|         [தமிழ் வாய்மொழி காப்பகம்]         |
|                                          |
|              பெரியவர்களின்               |
|                 கதைகள்                   |
|                — நம் மண்                 |
|                                          |
|    நம் தாத்தா பாட்டிகளின் குரலில், தமிழ்  |
|    மண்ணின் நினைவுகளைப் பாதுகாப்போம்.     |
|                                          |
|  +------------------------------------+  |
|  |    🎙 இப்போது பதிவு செய்யுங்கள்      |  | (48px Primary)
|  +------------------------------------+  |
|  |         கதைகளை உலாவுங்கள்          |  | (48px Outline)
|  +------------------------------------+  |
|                                          |
|          [ 6 கதைகள் ] [ 6 மாவட்டங்கள் ]   |
|                                          |
|               கீழே உருட்டுங்கள் ↓         |
+------------------------------------------+
|               ✦  ❋  ✦                    |
|             புலம் வாரியாக                |
|  [🌾 விவசாயம்] [🪔 பண்டிகை] [🍲 சமையல்] -> | (Horiz scroll)
+------------------------------------------+
|               ✦  ❋  ✦                    |
|              புதிய கதைகள்                |
|  [🔍 தேடு — தலைப்பு, விளக்கம்...]       |
|                                          |
|  +------------------------------------+  |
|  | 1970களில் பொள்ளாச்சி சந்தை        |  |
|  | 📍 கோயம்புத்தூர் · 🏷 பண்டிகை        |  |
|  | "அப்போதெல்லாம் காலையில ஐந்து..."     |  |
|  | 👤 ராமசாமி           [✅ சரிபார்க்கப்பட்டது] |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | நெல் நடவு முறை                      |  |
|  | 📍 தஞ்சாவூர் · 🌾 விவசாயம்          |  |
|  | "ஆடிப்பட்டத்துல விதை விதைத்து..."   |  |
|  | 👤 முத்தம்மாள்       [✅ சரிபார்க்கப்பட்டது] |
|  +------------------------------------+  |
+------------------------------------------+
|               ✦  ❋  ✦                    |
|  © தமிழ்த் தடம் · 2026                   |
+------------------------------------------+
```

---

### மொபைல் கதை விவரப் பக்கம் வரிவடிவம் (Mobile Story Player Wireframe)
```text
+------------------------------------------+
| ← முகப்புக்குத் திரும்பு                  |
|                                          |
| 1970களில் பொள்ளாச்சி சந்தை நினைவுகள்      |
| 📍 கோயம்புத்தூர் · 🏷 பண்டிகை · 👤 ராமசாமி |
| [✅ சரிபார்க்கப்பட்டது]                  |
| ──────────────────────────────────────── |
|                                          |
| கதைச் சுருக்கம்:                         |
| "பொள்ளாச்சி மாட்டுச் சந்தையின் பழைய     |
| சிறப்புகளையும் பண்டிகை வர்த்தகத்தையும்..." |
|                                          |
| +--------------------------------------+ |
| |  [ ▶ இயக்கு ]   0:15 / 2:34          | |
| |  [━━━━━●───────────────────────────]  | |
| +--------------------------------------+ |
|                                          |
| ஒலிவடிவ எழுத்துரை (வரிகளைத் தொட்டு கேட்கலாம்): |
|                                          |
| +--------------------------------------+ |
| | 0:00  வணக்கம், என் பேரு ராமசாமி...  | |
| +--------------------------------------+ |
| | 0:15  [தங்க நிற பார்டர் & பின்னணி]   | |
| |       அப்போதெல்லாம் காலையில ஐந்து   | |
| |       மணிக்கே மாட்டு வண்டி...        | |
| +--------------------------------------+ |
| | 0:34  சந்தையில விதவிதமான தானியங்கள்...| |
| +--------------------------------------+ |
+------------------------------------------+
```

---

## 10. ரிஹானா & டீனாவுக்கான சரிபார்ப்புப் பட்டியல் (Hand-off Checklists)

### 🎨 ரிஹானாவின் சரிபார்ப்புப் பட்டியல் (Frontend Checklist)
1. [ ] `globals.css` கோப்பில் கொடுக்கப்பட்டுள்ள CSS Variables அனைத்தையும் சேர்க்கவும்.
2. [ ] Google Fonts `Noto Sans Tamil` (400, 500, 600, 700) நிறுவப்பட்டு இயல்புநிலை எழுத்துருவாக உள்ளதா எனச் சரிபார்க்கவும்.
3. [ ] `StoryPlayer` உருவாக்கவும்: ஆடியோ நேரத்திற்கு ஏற்ப வரியை ஹைலைட் செய்து, வரியைத் தொட்டால் `audio.currentTime` மாறும்படி click-to-seek இணைக்கவும்.
4. [ ] `AudioRecorder` உருவாக்கவும்: Web Audio API கொண்டு ஒலிப்பதிவு, டைமர், மற்றும் `interview-prompts.json` சுழற்சியை அமைக்கவும்.
5. [ ] அனைத்து ஊடாடும் கூறுகளுக்கும் (Buttons, Chips, Inputs) குறைந்தபட்சம் 44×44px தொடு பரப்பளவு உள்ளதை உறுதி செய்யவும்.
6. [ ] UI-ல் ஆங்கில சொற்கள் ஏதுமின்றி 100% தூய தமிழ் இடைமுகம் உள்ளதை உறுதிப்படுத்தவும்.

### ⚙️ டீனாவின் சரிபார்ப்புப் பட்டியல் (Backend Checklist)
1. [ ] Supabase-ல் `stories` அட்டவணை மற்றும் `audios` Storage bucket உருவாக்கவும்.
2. [ ] `/api/record/upload` endpoint அமைத்து, ஆடியோ கோப்பை Supabase Storage-ல் சேமித்து பொது URL வழங்கவும்.
3. [ ] `/api/record/process` endpoint-ல் Sarvam ASR (`src/lib/transcribe.ts`) மற்றும் Gemini 3.8 Flash (`src/lib/enrich.ts`) தொடர் செயலாக்கத்தை இணைக்கவும்.
4. [ ] `/api/stories` endpoint-ல் மாவட்டம், புலம், நிலை, தேடல் மற்றும் வரிசைப்படுத்துதல் வடிகட்டிகளை உருவாக்கவும்.
5. [ ] `interview-prompts.json` தரவு மூலம் வகை வாரியாக கேள்விகளை வழங்கும் API-ஐ உறுதிப்படுத்தவும்.

---
**வடிவமைப்பு ஆவணம் நிறைவுற்றது.**
தமிழ்த் தடம் — நம் முன்னோர்களின் குரல்களை காலத்தால் அழியாமல் பாதுகாப்போம்!
