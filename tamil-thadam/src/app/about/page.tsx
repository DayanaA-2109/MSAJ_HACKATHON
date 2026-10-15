// src/app/about/page.tsx
import Link from "next/link";
import OrnamentDivider from "@/components/OrnamentDivider";

export const metadata = {
  title: "எங்களைப் பற்றி — தமிழ்த் தடம்",
  description: "நம் முன்னோர்களின் வாய்மொழி மரபைப் பாதுகாக்கும் மக்கள் காப்பகம். தமிழ்த் தடம் அறிமுகம், நோக்கம் மற்றும் தொழில்நுட்பக் கட்டமைப்பு.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#8B1E1E] mb-3">
          எங்களைப் பற்றி — தமிழ்த் தடம்
        </h1>
        <p className="text-base sm:text-lg text-[#7A6A55] max-w-xl mx-auto">
          நம் முன்னோர்களின் வாய்மொழி மரபைப் பாதுகாக்கும் மக்கள் காப்பகம்
        </p>
      </div>

      <OrnamentDivider />

      {/* Narrative Section */}
      <div className="manuscript-card my-10 p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-bold text-[#8B1E1E] mb-4">
          ஏன் இந்த வாய்மொழிக் காப்பகம்?
        </h2>
        <blockquote className="border-l-4 border-[#D4A017] pl-4 py-2 my-4 text-base sm:text-lg italic text-[#2B1810]/90 leading-relaxed bg-[#FDF8EE] rounded-r-lg">
          &ldquo;எழுத்துகளில் வராத எத்தனையோ உண்மைகளும், பண்பாட்டு வாழ்வியல் பாடங்களும் நம் கிராமத்துப் பெரியவர்களின் பேச்சில் மட்டுமே வாழ்கின்றன. அவர்கள் மறைந்தால் ஒரு நூலகமே எரிந்து சாம்பலாவதற்கு சமம்.&rdquo;
        </blockquote>
        <p className="text-base text-[#2B1810] leading-loose mt-4">
          தமிழ்த் தடம் (Tamil Thadam) என்பது நவீன செயற்கை நுண்ணறிவு தொழில்நுட்பத்தைப் பயன்படுத்தி, தமிழ்நாட்டின் மூத்த தலைமுறையினரின் (60+) நினைவுகளையும் வட்டார வழக்குகளையும் அவர்களின் சொந்தக் குரலிலேயே அடுத்த தலைமுறைக்குக் கொண்டு சேர்க்கும் ஒரு திறந்த வரலாற்றுப் பெட்டகமாகும்.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-10">
        <div className="manuscript-card text-center p-6">
          <span className="text-4xl block mb-3">🎙</span>
          <h3 className="text-lg font-bold text-[#8B1E1E] mb-2">1. எளிய குரல் பதிவு</h3>
          <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
            முதியவர்களும் எளிதாகப் பேசும் வகையில் எளிய வினாக்களுடன் கூடிய ஒரு-தொடு ஒலிப்பதிவு கருவி.
          </p>
        </div>

        <div className="manuscript-card text-center p-6">
          <span className="text-4xl block mb-3">⚡</span>
          <h3 className="text-lg font-bold text-[#8B1E1E] mb-2">2. தமிழ் AI பகுப்பாய்வு</h3>
          <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
            Sarvam AI மூலம் துல்லியமான தமிழ் ஒலி-எழுத்துப் பெயர்ப்பு மற்றும் Gemini AI மூலம் உடனடி சுருக்கம்.
          </p>
        </div>

        <div className="manuscript-card text-center p-6">
          <span className="text-4xl block mb-3">🏛</span>
          <h3 className="text-lg font-bold text-[#8B1E1E] mb-2">3. மக்கள் காப்பகம்</h3>
          <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
            எல்லா மாவட்டங்கள், பண்பாட்டுக் களங்கள் மற்றும் ஆய்வாளர்களுக்குப் பயன்படும் நிரந்தர வரலாற்று ஆவணம்.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-[#FFFDF7] border border-[#D9C9A8] rounded-2xl p-6 sm:p-8 my-10">
        <h3 className="text-xl font-bold text-[#8B1E1E] mb-4 text-center">
          பயன்படுத்தப்படும் நவீன தொழில்நுட்பங்கள்
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-[#FDF8EE] rounded-xl border border-[#D9C9A8]">
            <div className="text-lg font-bold text-[#8B1E1E]">Next.js 16</div>
            <div className="text-xs text-[#7A6A55] mt-1">App Router &amp; React 19</div>
          </div>
          <div className="p-3 bg-[#FDF8EE] rounded-xl border border-[#D9C9A8]">
            <div className="text-lg font-bold text-[#8B1E1E]">Sarvam AI</div>
            <div className="text-xs text-[#7A6A55] mt-1">Saarika v2.5 தமிழ் ASR</div>
          </div>
          <div className="p-3 bg-[#FDF8EE] rounded-xl border border-[#D9C9A8]">
            <div className="text-lg font-bold text-[#8B1E1E]">Gemini 2.5</div>
            <div className="text-xs text-[#7A6A55] mt-1">கலாச்சாரச் சுருக்கம்</div>
          </div>
          <div className="p-3 bg-[#FDF8EE] rounded-xl border border-[#D9C9A8]">
            <div className="text-lg font-bold text-[#8B1E1E]">Supabase</div>
            <div className="text-xs text-[#7A6A55] mt-1">பாதுகாப்பான தரவுத்தளம்</div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="manuscript-card text-center p-8 sm:p-12 my-12 bg-gradient-to-b from-[#FFFDF7] to-[#F7EDD8]">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#8B1E1E] mb-3">
          உங்கள் குடும்பத்துப் பெரியவர்களின் குரலையும் ஆவணப்படுத்துங்கள்
        </h3>
        <p className="text-sm sm:text-base text-[#7A6A55] max-w-lg mx-auto mb-6">
          அவர்களின் ஒரு கதையும், ஒரு வாழ்க்கை அனுபவமும் வருங்கால தமிழ் மண்ணிற்கு விலைமதிப்பற்ற சொத்து.
        </p>
        <Link href="/record" className="stamp-btn-primary !text-lg !py-3.5 !px-8">
          <span>🎙</span>
          <span>இப்போது பதிவு செய்யுங்கள்</span>
        </Link>
      </div>

      <OrnamentDivider />
    </div>
  );
}
