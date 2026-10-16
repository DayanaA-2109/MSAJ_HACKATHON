import NeirkaanalList from "@/components/NeirkaanalList";
import { NEIRKAANAL_INTERVIEWS } from "@/data/neirkaanal";

export const metadata = {
  title: "நேர்காணல் — தமிழ்த் தடம்",
  description:
    "வாய்மொழி நேர்காணல்களின் சுருக்கமும் முழுப் படியெடுப்பும். தமிழிலும் ஆங்கிலத்திலும்.",
};

export default function NeirkaanalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <NeirkaanalList interviews={NEIRKAANAL_INTERVIEWS} />
    </div>
  );
}
