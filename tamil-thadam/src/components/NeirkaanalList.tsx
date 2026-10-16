import NeirkaanalCard from "@/components/NeirkaanalCard";
import {
  NEIRKAANAL_COPY,
  NeirkaanalInterview,
} from "@/data/neirkaanal";

export default function NeirkaanalList({
  interviews,
}: {
  interviews: NeirkaanalInterview[];
}) {
  const lang = "ta" as const;
  const copy = NEIRKAANAL_COPY[lang];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#8B1E1E] mb-3">
          {copy.heading}
        </h1>
        <p className="text-base sm:text-lg text-[#7A6A55] max-w-xl mx-auto leading-relaxed">
          {copy.intro}
        </p>
      </div>

      <ul className="flex flex-col gap-6">
        {interviews.map((interview) => (
          <li key={interview.id}>
            <NeirkaanalCard interview={interview} lang={lang} />
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
        {copy.credit}
      </p>
    </div>
  );
}
