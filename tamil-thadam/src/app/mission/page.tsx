// src/app/mission/page.tsx
import Link from "next/link";
import OrnamentDivider from "@/components/OrnamentDivider";

export const metadata = {
  title: "திட்ட நோக்கம் & தொலைநோக்குப் பார்வை — தமிழ்த் தடம்",
  description: "தமிழ் தடம் திட்டத்தின் தொலைநோக்குப் பார்வை, தீர்க்கப்படும் சமூகப் பிரச்சினைகள், AI தீர்வு மற்றும் பண்பாட்டுத் தாக்கம்.",
};

export default function MissionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* =========================================================================
          HERO HEADER
          ========================================================================= */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4A017] bg-[#FDF1D0]/70 text-[#8B1E1E] text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
          <span>📜</span>
          <span>Project Vision &amp; Mission · திட்ட நோக்கம்</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#8B1E1E] mb-3 tracking-tight">
          தமிழ்த் தடம் — திட்ட நோக்கம்
        </h1>
        <p className="text-base sm:text-lg text-[#7A6A55] max-w-2xl mx-auto leading-relaxed">
          நமது மூத்த தலைமுறையினரின் மறைந்து வரும் வாய்மொழி வரலாற்றை அடுத்த தலைமுறைக்குக் கொண்டு சேர்க்கும் AI-இயக்கப்படும் மக்கள் காப்பகம்.
        </p>
      </div>

      <OrnamentDivider symbols="✦ ❋ ✺ ❋ ✦" />

      {/* =========================================================================
          SECTION 1 — தொலைநோக்குப் பார்வை (OUR MISSION)
          ========================================================================= */}
      <section className="my-10">
        <div className="manuscript-card p-6 sm:p-10 border-2 border-[#D4A017]/70 shadow-sm bg-gradient-to-b from-[#FFFDF7] to-[#FDF8EE]">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#8B1E1E]">
              1. எங்கள் முதன்மை நோக்கம் (Our Mission)
            </h2>
          </div>

          <blockquote className="border-l-4 border-[#8B1E1E] pl-5 py-3.5 my-4 text-base sm:text-lg text-[#2B1810] leading-relaxed bg-[#FFFDF7] rounded-r-xl font-medium shadow-2xs">
            &ldquo;தமிழ் மொழியின் வாய்மொழி வரலாற்றை காலத்தால் அழியாத டிஜிட்டல் வடிவில் பாதுகாப்பதே <strong>தமிழ்த் தடம்</strong> திட்டத்தின் தலையாய நோக்கம். நமது மூத்த தலைமுறையினரின் வாழ்வியல் அனுபவங்கள், நாட்டுப்புற மரபுகள், வட்டார வழக்குகள் மற்றும் பாரம்பரிய அறிவாற்றல் — இவை அனைத்தும் அவர்களுடன் மறைந்து போவதற்குள், அவற்றை முறையாகப் பதிவுசெய்து, தானியங்கி தமிழ் எழுத்துப்பதிவாக மாற்றி, தேடக்கூடிய பெட்டகமாக அடுத்த தலைமுறைக்குக் கடத்துகிறோம்.&rdquo;
          </blockquote>

          <div className="mt-6 p-4 rounded-xl bg-[#F7EDD8]/60 border border-[#D9C9A8] text-sm text-[#7A6A55] leading-relaxed">
            <span className="font-bold text-[#8B1E1E] block mb-1">
              🌐 Executive Summary:
            </span>
            <p className="italic">
              Tamil Thadam is an AI-powered cultural archive dedicated to preserving Tamil oral history. Before our elders&apos; memories, wisdom, and folklore vanish with time, we provide an accessible platform to record, transcribe, index, and permanently archive their voices for future generations and research.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — நாம் எதிர்கொள்ளும் சவால்கள் (THE CORE PROBLEMS)
          ========================================================================= */}
      <section className="my-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] text-xs font-bold uppercase tracking-wider mb-2">
            The Challenges We Solve
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#8B1E1E]">
            2. நாம் எதிர்கொள்ளும் 4 தலையாய சவால்கள்
          </h2>
          <p className="text-sm sm:text-base text-[#7A6A55] max-w-2xl mx-auto mt-2 leading-relaxed">
            ஒவ்வொரு நாளும் நமது மண்ணின் விலைமதிப்பற்ற வாய்மொழி மரபுகள் ஆவணப்படுத்தப்படாமலேயே மறைந்து வருகின்றன.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Challenge 1 */}
          <div className="manuscript-card p-6 border-l-4 border-l-[#8B1E1E] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#8B1E1E]">
                  ஆவணப்படுத்தப்படாத மூதாதையர் அறிவு
                </h3>
              </div>
              <p className="text-sm sm:text-base text-[#2B1810] leading-relaxed">
                பாரம்பரிய விவசாய நடைமுறைகள், நாட்டுப்புற மருத்துவம், கிராமக் குலவரலாறுகள், நாட்டுப்புறப் பாடல்கள் போன்றவை புத்தகங்களில் எழுதப்படாதவை. ஒரு மூத்தவர் இயற்கை எய்தும்போது, அவருடன் ஒரு முழு வாழ்க்கை நூலகமே மறைந்துவிடுகிறது.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9C9A8]/60 text-xs text-[#7A6A55] italic">
              Oral indigenous knowledge disappears forever without timely recording.
            </div>
          </div>

          {/* Challenge 2 */}
          <div className="manuscript-card p-6 border-l-4 border-l-[#D4A017] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#D4A017] text-[#2B1810] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#8B1E1E]">
                  தலைமுறைகளுக்கு இடையேயான பிணைப்பு அறுபடுதல்
                </h3>
              </div>
              <p className="text-sm sm:text-base text-[#2B1810] leading-relaxed">
                வேகமாக நகரமயமாகும் சூழலில் வளரும் இளைய தலைமுறையினருக்கு தங்கள் கிராமப் பூர்வீகம், பாட்டி-தாத்தாக்களின் வாழ்க்கை அனுபவங்கள் மற்றும் மண் சார்ந்த பண்பாட்டு விழுமியங்கள் சென்று சேர்வதில்லை.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9C9A8]/60 text-xs text-[#7A6A55] italic">
              Youth in modern cities are increasingly disconnected from their lineage and cultural roots.
            </div>
          </div>

          {/* Challenge 3 */}
          <div className="manuscript-card p-6 border-l-4 border-l-[#8B1E1E] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#8B1E1E]">
                  பொதுவான சமூக ஊடகங்களின் போதாமை
                </h3>
              </div>
              <p className="text-sm text-[#2B1810] leading-relaxed mb-3">
                யூடியூப், வாட்ஸ்அப் போன்ற தளங்களில் பகிரப்படும் ஆடியோ அல்லது வீடியோக்கள்:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#7A6A55]">
                <li className="flex items-center gap-2">
                  <span className="text-[#8B1E1E] font-bold">✕</span>
                  <span>உரையின் உட்பொருளைத் தேட முடிவதில்லை (Unsearchable voice clips)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8B1E1E] font-bold">✕</span>
                  <span>மாவட்டங்கள் மற்றும் பண்பாட்டுப் புலங்களாக வகைப்படுத்தப்படுவதில்லை</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8B1E1E] font-bold">✕</span>
                  <span>தமிழ் பேச்சுக்கு ஏற்ற தானியங்கி எழுத்துப்பதிவு கட்டமைப்பு இல்லை</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9C9A8]/60 text-xs text-[#7A6A55] italic">
              Generic platforms lack transcription, structured semantic categorization, and permanent archival.
            </div>
          </div>

          {/* Challenge 4 */}
          <div className="manuscript-card p-6 border-l-4 border-l-[#D4A017] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#D4A017] text-[#2B1810] flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#8B1E1E]">
                  வட்டார வழக்குகள் ஆவணப்படாமல் அழிதல்
                </h3>
              </div>
              <p className="text-sm sm:text-base text-[#2B1810] leading-relaxed">
                கொங்கு தமிழ், மதுரை வழக்கு, நெல்லைத் தமிழ், டெல்டா வழக்கு என ஒவ்வொரு மாவட்டத்திற்கும் தனித்துவமான பேச்சு வழக்குகளும், உச்சரிப்புகளும், வட்டாரச் சொற்களும் உள்ளன. இவை முறையாகப் புவிசார் குறியீடுகளுடன் பதிவு செய்யப்படாமல் மறைந்து வருகின்றன.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9C9A8]/60 text-xs text-[#7A6A55] italic">
              Rich regional Tamil dialects and phonetics are fading without geographic preservation.
            </div>
          </div>
        </div>
      </section>

      <OrnamentDivider symbols="✦ ❋ ✦" />

      {/* =========================================================================
          SECTION 3 — AI தீர்வு (OUR 6-STEP AI SOLUTION)
          ========================================================================= */}
      <section className="my-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold uppercase tracking-wider mb-2">
            The AI Pipeline
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#8B1E1E]">
            3. எங்கள் 6-படி செயற்கை நுண்ணறிவுத் தீர்வு
          </h2>
          <p className="text-sm sm:text-base text-[#7A6A55] max-w-xl mx-auto mt-2">
            ஒலிப்பதிவு முதல் நிரந்தர வரலாற்று ஆவணம் வரை இயங்கும் முழுமையான தானியங்கி கட்டமைப்பு:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="manuscript-card p-5 border-t-4 border-t-[#8B1E1E]">
            <div className="text-2xl mb-2">🎙️</div>
            <h4 className="font-bold text-[#8B1E1E] text-base mb-1">1. எளிய குரல் பதிவு</h4>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              முதியவர்கள் எளிதாகப் பேச 30+ வழிகாட்டும் வினாக்களுடன் கூடிய ஒரு-தொடு ஒலிப்பதிவு இடைமுகம்.
            </p>
          </div>

          <div className="manuscript-card p-5 border-t-4 border-t-[#D4A017]">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold text-[#8B1E1E] text-base mb-1">2. Sarvam AI எழுத்துப்பதிவு</h4>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              Saarika v2.5 தமிழ் ASR மூலம் பேச்சு ஒலி துல்லியமான நேர முத்திரைகளுடன் (Timestamps) உரையாக மாற்றப்படுகிறது.
            </p>
          </div>

          <div className="manuscript-card p-5 border-t-4 border-t-[#8B1E1E]">
            <div className="text-2xl mb-2">🤖</div>
            <h4 className="font-bold text-[#8B1E1E] text-base mb-1">3. Gemini AI சுருக்கம்</h4>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              முக்கிய பண்பாட்டுக் குறிச்சொற்கள், மனிதர்கள், இடங்கள் மற்றும் சுருக்கமான உரை தானாக உருவாக்கப்படுகிறது.
            </p>
          </div>

          <div className="manuscript-card p-5 border-t-4 border-t-[#D4A017]">
            <div className="text-2xl mb-2">🗺️</div>
            <h4 className="font-bold text-[#8B1E1E] text-base mb-1">4. புலம் &amp; மாவட்ட வகைப்பாடு</h4>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              38 தமிழ்நாடு மாவட்டங்கள் மற்றும் 8 பண்பாட்டுப் புலங்கள் வாரியாக வரிசைப்படுத்தப்பட்டு வரைபடத்தில் காட்டப்படுகிறது.
            </p>
          </div>

          <div className="manuscript-card p-5 border-t-4 border-t-[#8B1E1E]">
            <div className="text-2xl mb-2">🔍</div>
            <h4 className="font-bold text-[#8B1E1E] text-base mb-1">5. முழு உரைத் தேடல்</h4>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              எந்தவொரு தமிழ் சொல்லையும் தட்டச்சு செய்து குறிப்பிட்ட கதை மற்றும் ஒலித்துண்டைக் கணப்பொழுதில் கண்டறியலாம்.
            </p>
          </div>

          <div className="manuscript-card p-5 border-t-4 border-t-[#D4A017]">
            <div className="text-2xl mb-2">🏛️</div>
            <h4 className="font-bold text-[#8B1E1E] text-base mb-1">6. நிரந்தரக் காப்பகம்</h4>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              Supabase மேகக் காப்பகத்தில் அனைத்துக் குரல்களும் அடுத்த தலைமுறை ஆய்வுகளுக்காகப் பாதுகாப்பாகச் சேமிக்கப்படுகின்றன.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — இதன் முக்கியத்துவம் (WHY IT MATTERS)
          ========================================================================= */}
      <section className="my-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/20 text-[#8B1E1E] text-xs font-bold uppercase tracking-wider mb-2">
            Why It Matters
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#8B1E1E]">
            4. திட்டத்தின் சமூக &amp; வரலாற்று முக்கியத்துவம்
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="manuscript-card p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#8B1E1E] mb-2 flex items-center gap-2">
              <span>🌱</span>
              <span>கலாச்சாரப் பாதுகாப்பு (Cultural Heritage)</span>
            </h3>
            <p className="text-sm text-[#2B1810] leading-relaxed">
              2,000-க்கும் மேற்பட்ட ஆண்டுகள் பழைமையான தமிழ் இலக்கிய மரபின் உயிருள்ள வேர்கள் பாமர மக்களின் வாய்மொழி வழக்குகளே. அவற்றை ஆவணப்படுத்துவது நமது மொழியியல் கடமையாகும்.
            </p>
          </div>

          <div className="manuscript-card p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#8B1E1E] mb-2 flex items-center gap-2">
              <span>🌱</span>
              <span>நாட்டுப்புற அறிவியல் &amp; ஆராய்ச்சி (Indigenous Knowledge)</span>
            </h3>
            <p className="text-sm text-[#2B1810] leading-relaxed">
              பாரம்பரிய மழை முன்னறிவிப்பு, நஞ்சில்லா இயற்கை விவசாய நுணுக்கங்கள், நாட்டுப்புற மருத்துவ முறைகள் ஆகியவை நவீன அறிவியல் ஆய்வுகளுக்கு உந்துதலாக அமையும்.
            </p>
          </div>

          <div className="manuscript-card p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#8B1E1E] mb-2 flex items-center gap-2">
              <span>🌱</span>
              <span>குடும்ப அடையாளம் &amp; வேர்கள் (Generational Connection)</span>
            </h3>
            <p className="text-sm text-[#2B1810] leading-relaxed">
              பேரக் குழந்தைகளும் வருங்காலத் தலைமுறையினரும் தங்களது முன்னோர்களின் சொந்தக் குரலையும் வாழ்க்கைப் போராட்டங்களையும் கேட்டுப் பெருமிதம் கொள்ள முடிகிறது.
            </p>
          </div>

          <div className="manuscript-card p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#8B1E1E] mb-2 flex items-center gap-2">
              <span>🌱</span>
              <span>இணையத்தில் தமிழின் தடம் (Digital Tamil Content)</span>
            </h3>
            <p className="text-sm text-[#2B1810] leading-relaxed">
              இணையப் பரப்பில் தமிழ் வட்டார பேச்சுத் தரவுகளின் இருப்பை அதிகரித்து, வருங்கால செயற்கை நுண்ணறிவு மாதிரிகள் தமிழின் நுட்பங்களைப் புரிந்துகொள்ள வழிவகுக்கிறது.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — தாக்கம் (IMPACT METRICS)
          ========================================================================= */}
      <section className="my-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] text-xs font-bold uppercase tracking-wider mb-2">
            Target &amp; Impact
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#8B1E1E]">
            5. திட்டத்தின் இலக்குகளும் தாக்கமும்
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="manuscript-card text-center p-5 border border-[#D9C9A8]">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#8B1E1E] mb-1">100+</div>
            <div className="text-xs sm:text-sm font-semibold text-[#2B1810]">வாய்மொழிக் கதைகள்</div>
            <div className="text-[11px] text-[#7A6A55] mt-1">முதலாண்டு இலக்கு</div>
          </div>

          <div className="manuscript-card text-center p-5 border border-[#D9C9A8]">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#8B1E1E] mb-1">38</div>
            <div className="text-xs sm:text-sm font-semibold text-[#2B1810]">மாவட்டங்கள்</div>
            <div className="text-[11px] text-[#7A6A55] mt-1">தமிழகம் முழுவதும்</div>
          </div>

          <div className="manuscript-card text-center p-5 border border-[#D9C9A8]">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#8B1E1E] mb-1">8</div>
            <div className="text-xs sm:text-sm font-semibold text-[#2B1810]">பண்பாட்டுப் புலங்கள்</div>
            <div className="text-[11px] text-[#7A6A55] mt-1">விவசாயம் முதல் நாட்டுப்புறம் வரை</div>
          </div>

          <div className="manuscript-card text-center p-5 border border-[#D9C9A8]">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#8B1E1E] mb-1">2,000+</div>
            <div className="text-xs sm:text-sm font-semibold text-[#2B1810]">நிமிடங்கள் ஆடியோ</div>
            <div className="text-[11px] text-[#7A6A55] mt-1">உயர்தரக் காப்பகம்</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — தனித்துவமான வேறுபாடு (COMPARISON)
          ========================================================================= */}
      <section className="my-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#8B1E1E]">
            6. பிற தளங்களிலிருந்து தமிழ்த் தடம் எவ்வாறு வேறுபடுகிறது?
          </h2>
        </div>

        <div className="overflow-x-auto manuscript-card p-0 rounded-2xl border border-[#D9C9A8] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7EDD8] border-b border-[#D9C9A8]">
                <th className="py-3.5 px-4 sm:px-6 font-bold text-[#7A6A55] w-1/2">
                  பொதுவான சமூக ஊடகங்கள் (YouTube, WhatsApp, FB)
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-bold text-[#8B1E1E] w-1/2 bg-[#FDF1D0]">
                  தமிழ்த் தடம் (Tamil Thadam)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9C9A8]/60 text-[#2B1810]">
              <tr>
                <td className="py-3.5 px-4 sm:px-6 text-[#7A6A55]">ஆடியோவின் குறிப்பிட்ட உரையைத் தேட முடிவதில்லை</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#8B1E1E] bg-[#FFFDF7]">
                  ✅ முழு உரைத் தமிழ் தேடல் மற்றும் நேர முத்திரை தாவல்
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 text-[#7A6A55]">பதிவுகள் காலப்போக்கில் அழிந்துவிடும் அபாயம்</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#8B1E1E] bg-[#FFFDF7]">
                  ✅ நிரந்தர மேக வரலாற்று ஆவணம்
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 text-[#7A6A55]">வகைப்படுத்தல் இல்லை</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#8B1E1E] bg-[#FFFDF7]">
                  ✅ மாவட்டம் மற்றும் பண்பாட்டுப் புலம் வாரியான கட்டமைப்பு
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 text-[#7A6A55]">ஆங்கிலத்தை மையமாகக் கொண்ட பொதுவான வடிவமைப்பு</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#8B1E1E] bg-[#FFFDF7]">
                  ✅ தமிழுக்காகவே பிரத்யேகமாக உருவாக்கப்பட்ட கலை வடிவம்
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — அழைப்பு (CALL TO ACTION)
          ========================================================================= */}
      <section className="my-14">
        <div className="manuscript-card text-center p-8 sm:p-12 bg-gradient-to-b from-[#FFFDF7] via-[#FDF8EE] to-[#F7EDD8] border-2 border-[#D4A017] shadow-md">
          <span className="text-4xl block mb-3">🎙️</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#8B1E1E] mb-3">
            உங்கள் மூத்தவர்களின் குரலையும் ஆவணப்படுத்துங்கள்
          </h3>
          <p className="text-base sm:text-lg text-[#2B1810] font-medium max-w-xl mx-auto mb-6 leading-relaxed">
            உங்கள் பாட்டி-தாத்தா, பெரியவர்கள் மற்றும் கிராமத்து மனிதர்களின் கதைகளைப் பதிவு செய்யுங்கள். ஒரு பத்து நிமிடப் பதிவு, ஒரு தலைமுறைக்கான வரலாற்றுச் சொத்து!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/record" className="stamp-btn-primary !text-lg !py-3.5 !px-8 shadow-sm">
              <span>🎙</span>
              <span>இப்போதே கதை பதிவு செய்ய</span>
            </Link>
            <Link href="/browse" className="stamp-btn-outline !text-lg !py-3.5 !px-8">
              <span>களக் கதைகளைக் கேட்க</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <OrnamentDivider symbols="✦ ❋ ✺ ❋ ✦" />
    </div>
  );
}
