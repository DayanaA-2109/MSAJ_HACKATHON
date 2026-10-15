// src/lib/speechmatics.ts


const SPEECHMATICS_API_URL = 'https://asr.api.speechmatics.com/v2';

// This matches the structure your existing transcribeAudio function returns.
export type TranscriptResult = {
  fullText: string;
  segments: { start: number; end: number; text: string }[];
  language: string;
  confidence?: number;
};

export async function transcribeWithSpeechmatics(audioBuffer: Buffer, filename: string): Promise<TranscriptResult> {
    const SPEECHMATICS_API_KEY = process.env.SPEECHMATICS_API_KEY;
  if (!SPEECHMATICS_API_KEY) {
    throw new Error('SPEECHMATICS_API_KEY is not set in .env.local');
  }

  // 1. Create the job configuration
  const config = {
    type: 'transcription',
    transcription_config: {
      language: 'ta', // 'ta' is the language code for Tamil
      operating_point: 'enhanced', // Use the higher accuracy model
      enable_partials: false,
    },
  };

  // 2. Build the multipart form data
  const formData = new FormData();
  // The API expects the file field to be named "data_file"
  formData.append('data_file', new Blob([audioBuffer]), filename);
  formData.append('config', JSON.stringify(config));

  // 3. Submit the job and wait for the transcript
  // Using the `wait` parameter to block until the job finishes (up to 120 seconds)
  const jobResponse = await fetch(`${SPEECHMATICS_API_URL}/jobs/?wait=120&format=json-v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SPEECHMATICS_API_KEY}`,
    },
    body: formData,
  });

  if (!jobResponse.ok) {
    const errorText = await jobResponse.text();
    throw new Error(`Speechmatics job submission failed: ${jobResponse.status} ${errorText}`);
  }

  const jobData: any = await jobResponse.json();

  if (jobData.status !== 'done') {
    throw new Error(`Speechmatics job did not complete. Status: ${jobData.status}`);
  }

  // 4. Map the Speechmatics JSON response to your TranscriptResult structure
  // The structure of the response is nested under the 'results' array.
  const results = jobData.results || [];
  
  // Group words into segments based on punctuation or speaker changes.
  // For a simple approach, we can group by speaker or by gaps in time.
  const segments: { start: number; end: number; text: string }[] = [];
  let currentSegment = { start: 0, end: 0, text: '' };

  for (const result of results) {
    const alt = result.alternatives[0];
    if (!alt) continue;

    const word = alt.content;
    const isPunctuation = result.type === 'punctuation';
    
    // Start a new segment if there's a speaker change or a long gap, or if it's punctuation followed by a new sentence.
    // This is a simplified logic; you can make it more robust.
    const gap = currentSegment.text ? result.start_time - currentSegment.end : 0;
    
    if (currentSegment.text && (gap > 0.5 || (result.type === 'word' && alt.speaker !== results[0].alternatives[0].speaker))) {
        if (currentSegment.text.trim()) segments.push({...currentSegment});
        currentSegment = { start: result.start_time, end: result.end_time, text: word };
    } else {
        if (!currentSegment.text) currentSegment.start = result.start_time;
        currentSegment.end = result.end_time;
        // Add space before word if it's not punctuation and not the first word
        currentSegment.text += (isPunctuation ? '' : ' ') + word;
    }
  }
  if (currentSegment.text.trim()) segments.push({...currentSegment});

  return {
    fullText: segments.map(s => s.text).join(' ').trim(), // A simple full text join
    segments: segments,
    language: 'ta',
  };
}