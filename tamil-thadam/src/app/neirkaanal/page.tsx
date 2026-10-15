import NeirkaanalList from "@/components/NeirkaanalList";
import { NEIRKAANAL_INTERVIEWS } from "@/data/neirkaanal";

export const metadata = {
  title: "Neirkaanal (நேர்காணல்) — தமிழ்த் தடம்",
  description:
    "YouTube நேர்காணல்களின் சுருக்கமும் முழுப் படியெடுப்பும். வாழ்க்கை மற்றும் வரலாற்றுப் பிரிவுகள்.",
};

export default function NeirkaanalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#8B1E1E] mb-3">
          Neirkaanal (நேர்காணல்)
        </h1>
        <p className="text-base sm:text-lg text-[#7A6A55] max-w-xl mx-auto leading-relaxed">
          வாழ்க்கை (Vaazhkai) மற்றும் வரலாறு (Varalaru) சார்ந்த YouTube நேர்காணல்கள் —
          சுருக்கம், முழுப் படியெடுப்பு, மூலக் காணொளி இணைப்பு.
        </p>
      </div>

      <NeirkaanalList interviews={NEIRKAANAL_INTERVIEWS} />

      <p className="mt-10 text-center text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
        Summaries are for reference. All credit to the original creators on YouTube.
      </p>
    </div>
  );
}
