import TamilNaduMap from "@/components/TamilNaduMap";

export const metadata = {
  title: "காட்சி — தமிழ்நாடு மாவட்ட வரைபடம் | தமிழ்த் தடம்",
  description:
    "தமிழ்நாட்டின் மாவட்டங்களை ஊடாடும் வரைபடத்தில் காணுங்கள். ஒவ்வொரு மாவட்டத்தின் நினைவுக் குறிப்பையும் தேர்ந்தெடுத்துப் படியுங்கள்.",
};

export default function MapPage() {
  return (
    <div className="relative min-h-[calc(100vh-5.5rem)] bg-[#EFEBE3]">
      <TamilNaduMap />
    </div>
  );
}
